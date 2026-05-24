import { getAuthUserId } from '@convex-dev/auth/server';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

type AuthCtx = QueryCtx | MutationCtx;

export async function requireUserId(ctx: AuthCtx): Promise<Id<'users'>> {
	const userId = await getAuthUserId(ctx);
	if (userId === null) {
		throw new Error('Not authenticated');
	}
	return userId;
}

export async function requireUserProfile(ctx: AuthCtx) {
	const userId = await requireUserId(ctx);
	const profile = await ctx.db
		.query('userProfiles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.unique();

	if (profile === null) {
		throw new Error('User profile not found');
	}

	return { userId, profile, familyId: profile.familyId };
}
