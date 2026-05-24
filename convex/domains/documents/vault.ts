import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';
import { requireUserProfile } from '../../lib/auth';

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireUserProfile(ctx);
		return await ctx.storage.generateUploadUrl();
	}
});

export const saveDocumentMetadata = mutation({
	args: {
		storageId: v.id('_storage'),
		fileName: v.string(),
		mimeType: v.string(),
		category: v.string(),
		tags: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		const { userId, familyId } = await requireUserProfile(ctx);

		return await ctx.db.insert('documents', {
			familyId,
			storageId: args.storageId,
			fileName: args.fileName,
			mimeType: args.mimeType,
			category: args.category,
			tags: args.tags ?? [],
			uploadedAt: Date.now(),
			uploadedBy: userId
		});
	}
});

export const listDocuments = query({
	args: {
		category: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { familyId } = await requireUserProfile(ctx);

		if (args.category) {
			return await ctx.db
				.query('documents')
				.withIndex('by_family_category', (q) =>
					q.eq('familyId', familyId).eq('category', args.category!)
				)
				.order('desc')
				.collect();
		}

		return await ctx.db
			.query('documents')
			.withIndex('by_family', (q) => q.eq('familyId', familyId))
			.order('desc')
			.collect();
	}
});

export const getDocumentUrlQuery = query({
	args: {
		documentId: v.id('documents')
	},
	handler: async (ctx, args) => {
		const { familyId } = await requireUserProfile(ctx);
		const document = await ctx.db.get(args.documentId);

		if (document === null || document.familyId !== familyId) {
			throw new Error('Document not found');
		}

		return await ctx.storage.getUrl(document.storageId);
	}
});

export const getRecentAttentionItems = query({
	args: {},
	handler: async (ctx) => {
		const { familyId } = await requireUserProfile(ctx);
		const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

		const documents = await ctx.db
			.query('documents')
			.withIndex('by_family', (q) => q.eq('familyId', familyId))
			.order('desc')
			.take(5);

		return documents
			.filter((doc) => doc.uploadedAt >= oneWeekAgo)
			.map((doc) => ({
				id: `document-${doc._id}`,
				domain: 'documents' as const,
				title: `New upload: ${doc.fileName}`,
				dueDate: doc.uploadedAt,
				priority: 'low' as const,
				href: '/vault'
			}));
	}
});
