import { query } from '../../_generated/server';
import type { AttentionItem } from '../../lib/attentionItems';
import { requireUserProfile } from '../../lib/auth';

export const getAttentionFeed = query({
	args: {},
	handler: async (ctx): Promise<AttentionItem[]> => {
		const { familyId } = await requireUserProfile(ctx);
		const now = Date.now();
		const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;
		const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

		const pendingPayments = await ctx.db
			.query('pendingPayments')
			.withIndex('by_family_status', (q) => q.eq('familyId', familyId).eq('status', 'pending'))
			.collect();

		const billItems: AttentionItem[] = pendingPayments
			.filter((payment) => payment.dueDate <= oneWeekFromNow)
			.map((payment) => ({
				id: `bill-${payment._id}`,
				domain: 'bills',
				title: `${payment.vendorName} — $${payment.amountDue.toFixed(2)} due`,
				dueDate: payment.dueDate,
				priority: payment.dueDate <= now + 2 * 24 * 60 * 60 * 1000 ? 'high' : 'medium',
				href: '/bills'
			}));

		const recentDocuments = await ctx.db
			.query('documents')
			.withIndex('by_family', (q) => q.eq('familyId', familyId))
			.order('desc')
			.take(5);

		const documentItems: AttentionItem[] = recentDocuments
			.filter((doc) => doc.uploadedAt >= oneWeekAgo)
			.map((doc) => ({
				id: `document-${doc._id}`,
				domain: 'documents',
				title: `New upload: ${doc.fileName}`,
				dueDate: doc.uploadedAt,
				priority: 'low',
				href: '/vault'
			}));

		return [...billItems, ...documentItems].sort((a, b) => {
			const aDue = a.dueDate ?? 0;
			const bDue = b.dueDate ?? 0;
			return aDue - bDue;
		});
	}
});
