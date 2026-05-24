import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	...authTables,

	// --- families domain ---
	families: defineTable({
		name: v.string(),
		ownerId: v.id('users'),
		createdAt: v.number()
	}).index('by_owner', ['ownerId']),

	familyMembers: defineTable({
		familyId: v.id('families'),
		name: v.string(),
		role: v.union(v.literal('owner'), v.literal('adult'), v.literal('child')),
		userId: v.optional(v.id('users')),
		createdAt: v.number()
	}).index('by_family', ['familyId']),

	userProfiles: defineTable({
		userId: v.id('users'),
		familyId: v.id('families'),
		displayName: v.optional(v.string())
	})
		.index('by_user', ['userId'])
		.index('by_family', ['familyId']),

	// --- documents domain (shared vault) ---
	documents: defineTable({
		familyId: v.id('families'),
		storageId: v.id('_storage'),
		fileName: v.string(),
		mimeType: v.string(),
		category: v.string(),
		tags: v.array(v.string()),
		uploadedAt: v.number(),
		uploadedBy: v.id('users')
	})
		.index('by_family', ['familyId'])
		.index('by_family_category', ['familyId', 'category']),

	// --- bills domain ---
	pendingPayments: defineTable({
		familyId: v.id('families'),
		documentId: v.id('documents'),
		vendorName: v.string(),
		amountDue: v.number(),
		dueDate: v.number(),
		paymentDetails: v.optional(v.string()),
		status: v.union(v.literal('pending'), v.literal('reviewed'), v.literal('paid')),
		createdAt: v.number()
	})
		.index('by_family', ['familyId'])
		.index('by_family_status', ['familyId', 'status'])
		.index('by_family_due', ['familyId', 'dueDate'])
});
