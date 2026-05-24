import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalMutation, mutation, query } from '../../_generated/server';
import { requireUserId, requireUserProfile } from '../../lib/auth';

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return null;
		}

		const profile = await ctx.db
			.query('userProfiles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.unique();

		if (profile === null) {
			return { userId, profile: null, family: null };
		}

		const family = await ctx.db.get(profile.familyId);
		return { userId, profile, family };
	}
});

export const createFamily = mutation({
	args: {
		name: v.string(),
		displayName: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);

		const existingProfile = await ctx.db
			.query('userProfiles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.unique();

		if (existingProfile !== null) {
			throw new Error('User already belongs to a family');
		}

		const familyId = await ctx.db.insert('families', {
			name: args.name,
			ownerId: userId,
			createdAt: Date.now()
		});

		await ctx.db.insert('familyMembers', {
			familyId,
			name: args.displayName ?? 'Owner',
			role: 'owner',
			userId,
			createdAt: Date.now()
		});

		await ctx.db.insert('userProfiles', {
			userId,
			familyId,
			displayName: args.displayName
		});

		return familyId;
	}
});

export const bootstrapFamilyOnSignup = internalMutation({
	args: {
		userId: v.id('users'),
		displayName: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existingProfile = await ctx.db
			.query('userProfiles')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.unique();

		if (existingProfile !== null) {
			return existingProfile.familyId;
		}

		const familyId = await ctx.db.insert('families', {
			name: 'My Family',
			ownerId: args.userId,
			createdAt: Date.now()
		});

		await ctx.db.insert('familyMembers', {
			familyId,
			name: args.displayName ?? 'Owner',
			role: 'owner',
			userId: args.userId,
			createdAt: Date.now()
		});

		await ctx.db.insert('userProfiles', {
			userId: args.userId,
			familyId,
			displayName: args.displayName
		});

		return familyId;
	}
});

export const listMembers = query({
	args: {},
	handler: async (ctx) => {
		const { familyId } = await requireUserProfile(ctx);
		return await ctx.db
			.query('familyMembers')
			.withIndex('by_family', (q) => q.eq('familyId', familyId))
			.collect();
	}
});

export const addMember = mutation({
	args: {
		name: v.string(),
		role: v.union(v.literal('adult'), v.literal('child'))
	},
	handler: async (ctx, args) => {
		const { familyId } = await requireUserProfile(ctx);

		return await ctx.db.insert('familyMembers', {
			familyId,
			name: args.name,
			role: args.role,
			createdAt: Date.now()
		});
	}
});

export const updateMember = mutation({
	args: {
		memberId: v.id('familyMembers'),
		name: v.optional(v.string()),
		role: v.optional(v.union(v.literal('owner'), v.literal('adult'), v.literal('child')))
	},
	handler: async (ctx, args) => {
		const { familyId } = await requireUserProfile(ctx);
		const member = await ctx.db.get(args.memberId);

		if (member === null || member.familyId !== familyId) {
			throw new Error('Member not found');
		}

		const updates: { name?: string; role?: 'owner' | 'adult' | 'child' } = {};
		if (args.name !== undefined) updates.name = args.name;
		if (args.role !== undefined) updates.role = args.role;

		await ctx.db.patch(args.memberId, updates);
		return args.memberId;
	}
});
