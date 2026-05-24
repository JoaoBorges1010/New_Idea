import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';
import { requireUserProfile } from '../../lib/auth';

const dashboardWidgetValidator = v.object({
	id: v.string(),
	x: v.number(),
	y: v.number(),
	w: v.number(),
	h: v.number(),
	locked: v.optional(v.boolean())
});

const ALLOWED_WIDGET_IDS = new Set(['attention-feed', 'finance', 'tasks']);

export const getLayout = query({
	args: {},
	handler: async (ctx) => {
		const { profile } = await requireUserProfile(ctx);
		return profile.dashboardLayout ?? null;
	}
});

export const saveLayout = mutation({
	args: {
		layout: v.array(dashboardWidgetValidator)
	},
	handler: async (ctx, { layout }) => {
		const { profile } = await requireUserProfile(ctx);

		if (layout.length === 0) {
			throw new Error('Layout cannot be empty');
		}

		const ids = new Set<string>();
		for (const item of layout) {
			if (!ALLOWED_WIDGET_IDS.has(item.id)) {
				throw new Error(`Invalid widget id: ${item.id}`);
			}
			if (ids.has(item.id)) {
				throw new Error(`Duplicate widget id: ${item.id}`);
			}
			ids.add(item.id);
			if (item.w < 1 || item.h < 1 || item.x < 0 || item.y < 0) {
				throw new Error('Invalid widget dimensions');
			}
		}

		await ctx.db.patch(profile._id, { dashboardLayout: layout });
	}
});
