export type DashboardWidgetId = 'attention-feed' | 'finance' | 'tasks';

export type DashboardWidgetLayout = {
	id: DashboardWidgetId;
	x: number;
	y: number;
	w: number;
	h: number;
};

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetLayout[] = [
	{ id: 'attention-feed', x: 0, y: 0, w: 12, h: 3 },
	{ id: 'finance', x: 0, y: 3, w: 6, h: 2 },
	{ id: 'tasks', x: 6, y: 3, w: 6, h: 2 }
];

export function mergeDashboardLayout(
	saved:
		| Array<{ id: string; x: number; y: number; w: number; h: number }>
		| null
		| undefined
): DashboardWidgetLayout[] {
	if (!saved?.length) {
		return DEFAULT_DASHBOARD_LAYOUT.map((item) => ({ ...item }));
	}

	const savedById = new Map(saved.map((item) => [item.id, item]));
	return DEFAULT_DASHBOARD_LAYOUT.map((defaultItem) => {
		const savedItem = savedById.get(defaultItem.id);
		if (!savedItem) {
			return { ...defaultItem };
		}
		return {
			id: defaultItem.id,
			x: savedItem.x,
			y: savedItem.y,
			w: savedItem.w,
			h: savedItem.h
		};
	});
}

export function toSavedLayout(items: DashboardWidgetLayout[]): DashboardWidgetLayout[] {
	return items.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }));
}
