export type DashboardWidgetId = 'attention-feed' | 'finance' | 'tasks';

export type DashboardWidgetLayout = {
	id: DashboardWidgetId;
	x: number;
	y: number;
	w: number;
	h: number;
	locked?: boolean;
};

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetLayout[] = [
	{ id: 'attention-feed', x: 0, y: 0, w: 12, h: 3 },
	{ id: 'finance', x: 0, y: 3, w: 6, h: 2 },
	{ id: 'tasks', x: 6, y: 3, w: 6, h: 2 }
];

export function mergeDashboardLayout(
	saved:
		| Array<{ id: string; x: number; y: number; w: number; h: number; locked?: boolean }>
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
			h: savedItem.h,
			locked: savedItem.locked ?? false
		};
	});
}

export function cloneDashboardLayout(items: DashboardWidgetLayout[]): DashboardWidgetLayout[] {
	return items.map((item) => ({ ...item }));
}

export function widgetsOverlap(
	a: Pick<DashboardWidgetLayout, 'id' | 'x' | 'y' | 'w' | 'h'>,
	b: Pick<DashboardWidgetLayout, 'id' | 'x' | 'y' | 'w' | 'h'>
): boolean {
	if (a.id === b.id) return false;
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function layoutHasOverlaps(items: DashboardWidgetLayout[]): boolean {
	for (let i = 0; i < items.length; i++) {
		for (let j = i + 1; j < items.length; j++) {
			if (widgetsOverlap(items[i], items[j])) {
				return true;
			}
		}
	}
	return false;
}

export function toSavedLayout(items: DashboardWidgetLayout[]) {
	return items.map(({ id, x, y, w, h, locked }) => ({
		id,
		x,
		y,
		w,
		h,
		...(locked ? { locked: true } : {})
	}));
}
