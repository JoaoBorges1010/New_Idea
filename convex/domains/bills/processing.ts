import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { action, internalMutation, internalQuery, mutation, query } from '../../_generated/server';
import type { AttentionItem } from '../../lib/attentionItems';
import { requireUserProfile } from '../../lib/auth';
import { parseDocument } from '../../services/ai/parseDocument';
import { extractPdfText } from '../../services/storage/extractPdfText';

const BILL_PARSE_SYSTEM_PROMPT =
	'You extract structured bill payment data from document text. Return only valid JSON.';

const BILL_PARSE_SCHEMA =
	'Return JSON with keys: vendorName (string), amountDue (number), dueDate (ISO date string YYYY-MM-DD), paymentDetails (string, optional), confidence (number 0-1).';

type BillParseData = {
	vendorName?: string;
	amountDue?: number;
	dueDate?: string;
	paymentDetails?: string;
	confidence?: number;
};

function parseDueDate(value: string | undefined): number {
	if (!value) {
		return Date.now() + 7 * 24 * 60 * 60 * 1000;
	}
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? Date.now() + 7 * 24 * 60 * 60 * 1000 : parsed;
}

export const listPendingPayments = query({
	args: {},
	handler: async (ctx) => {
		const { familyId } = await requireUserProfile(ctx);
		return await ctx.db
			.query('pendingPayments')
			.withIndex('by_family', (q) => q.eq('familyId', familyId))
			.order('desc')
			.collect();
	}
});

export const updatePaymentStatus = mutation({
	args: {
		paymentId: v.id('pendingPayments'),
		status: v.union(v.literal('pending'), v.literal('reviewed'), v.literal('paid'))
	},
	handler: async (ctx, args) => {
		const { familyId } = await requireUserProfile(ctx);
		const payment = await ctx.db.get(args.paymentId);

		if (payment === null || payment.familyId !== familyId) {
			throw new Error('Payment not found');
		}

		await ctx.db.patch(args.paymentId, { status: args.status });
		return args.paymentId;
	}
});

export const getAttentionItems = query({
	args: {},
	handler: async (ctx): Promise<AttentionItem[]> => {
		const { familyId } = await requireUserProfile(ctx);
		const oneWeekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;

		const payments = await ctx.db
			.query('pendingPayments')
			.withIndex('by_family_status', (q) => q.eq('familyId', familyId).eq('status', 'pending'))
			.collect();

		return payments
			.filter((payment) => payment.dueDate <= oneWeekFromNow)
			.map((payment) => ({
				id: `bill-${payment._id}`,
				domain: 'bills' as const,
				title: `${payment.vendorName} — $${payment.amountDue.toFixed(2)} due`,
				dueDate: payment.dueDate,
				priority: payment.dueDate <= Date.now() + 2 * 24 * 60 * 60 * 1000 ? 'high' : 'medium',
				href: '/bills'
			}));
	}
});

export const createPendingPayment = internalMutation({
	args: {
		familyId: v.id('families'),
		documentId: v.id('documents'),
		vendorName: v.string(),
		amountDue: v.number(),
		dueDate: v.number(),
		paymentDetails: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('pendingPayments', {
			familyId: args.familyId,
			documentId: args.documentId,
			vendorName: args.vendorName,
			amountDue: args.amountDue,
			dueDate: args.dueDate,
			paymentDetails: args.paymentDetails,
			status: 'pending',
			createdAt: Date.now()
		});
	}
});

export const getDocumentForProcessing = internalQuery({
	args: {
		documentId: v.id('documents')
	},
	handler: async (ctx, args) => {
		const document = await ctx.db.get(args.documentId);
		if (document === null) {
			throw new Error('Document not found');
		}
		return document;
	}
});

export const processBillUpload = action({
	args: {
		documentId: v.id('documents')
	},
	handler: async (
		ctx,
		args
	): Promise<{ success: true; paymentId: string } | { success: false; error: string }> => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new Error('Not authenticated');
		}

		const document = await ctx.runQuery(
			internal.domains.bills.processing.getDocumentForProcessing,
			{
				documentId: args.documentId
			}
		);

		const fileUrl = await ctx.storage.getUrl(document.storageId);
		if (fileUrl === null) {
			return { success: false as const, error: 'Document file not found' };
		}

		const fileResponse = await fetch(fileUrl);
		if (!fileResponse.ok) {
			return { success: false as const, error: 'Failed to download document' };
		}

		const bytes = await fileResponse.arrayBuffer();
		const extracted = await extractPdfText({ bytes });
		if (!extracted.success) {
			return { success: false as const, error: extracted.error };
		}

		const parsed = await parseDocument({
			content: extracted.text,
			systemPrompt: BILL_PARSE_SYSTEM_PROMPT,
			schemaDescription: BILL_PARSE_SCHEMA
		});

		if (!parsed.success) {
			return { success: false as const, error: parsed.error };
		}

		const data = parsed.data as BillParseData;
		if (!data.vendorName || typeof data.amountDue !== 'number') {
			return { success: false as const, error: 'Could not extract required bill fields' };
		}

		if (typeof data.confidence === 'number' && data.confidence < 0.5) {
			return { success: false as const, error: 'Bill extraction confidence too low' };
		}

		const paymentId = await ctx.runMutation(
			internal.domains.bills.processing.createPendingPayment,
			{
				familyId: document.familyId,
				documentId: args.documentId,
				vendorName: data.vendorName,
				amountDue: data.amountDue,
				dueDate: parseDueDate(data.dueDate),
				paymentDetails: data.paymentDetails
			}
		);

		return { success: true as const, paymentId };
	}
});
