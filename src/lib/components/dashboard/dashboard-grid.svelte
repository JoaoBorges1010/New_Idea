<script lang="ts">
	import Grid, { GridItem } from '@appulsauce/svelte-grid';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Lock from '@lucide/svelte/icons/lock';
	import Unlock from '@lucide/svelte/icons/unlock';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import AttentionFeedWidget from '$lib/components/dashboard/widgets/attention-feed-widget.svelte';
	import FinanceWidget from '$lib/components/dashboard/widgets/finance-widget.svelte';
	import TasksWidget from '$lib/components/dashboard/widgets/tasks-widget.svelte';
	import {
		cloneDashboardLayout,
		layoutHasOverlaps,
		mergeDashboardLayout,
		toSavedLayout,
		type DashboardWidgetId,
		type DashboardWidgetLayout
	} from '$lib/dashboard/default-layout.js';

	const layoutQuery = useQuery(api.domains.dashboard.layout.getLayout, {});
	const client = useConvexClient();

	let items = $state<DashboardWidgetLayout[]>(mergeDashboardLayout(null));
	let layoutReady = $state(false);
	let lastSaved = $state('');
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let lockedBaselines = $state<Partial<Record<DashboardWidgetId, Pick<DashboardWidgetLayout, 'x' | 'y' | 'w' | 'h'>>>>({});
	let lastValidLayout = $state<DashboardWidgetLayout[]>([]);
	let interactionBaseline = $state<DashboardWidgetLayout[] | null>(null);

	const widgetLabels: Record<DashboardWidgetId, string> = {
		'attention-feed': 'Attention feed',
		finance: 'Finance',
		tasks: 'Tasks'
	};

	const itemSize = { height: 96 };

	$effect(() => {
		if (layoutQuery.data !== undefined && !layoutReady) {
			items = mergeDashboardLayout(layoutQuery.data);
			if (layoutHasOverlaps(items)) {
				items = cloneDashboardLayout(mergeDashboardLayout(null));
			}
			lockedBaselines = Object.fromEntries(
				items
					.filter((item) => item.locked)
					.map((item) => [item.id, { x: item.x, y: item.y, w: item.w, h: item.h }])
			);
			lastValidLayout = cloneDashboardLayout(items);
			lastSaved = JSON.stringify(toSavedLayout(items));
			layoutReady = true;
		}
	});

	function restoreInteractionLayout() {
		const restoreFrom = interactionBaseline ?? lastValidLayout;
		items = cloneDashboardLayout(restoreFrom);
		interactionBaseline = null;
		enforceLockedPositions();
	}

	function beginInteraction() {
		interactionBaseline = cloneDashboardLayout(items);
	}

	function enforceLockedPositions() {
		let changed = false;
		items = items.map((item) => {
			if (!item.locked) return item;

			const baseline = lockedBaselines[item.id] ?? {
				x: item.x,
				y: item.y,
				w: item.w,
				h: item.h
			};

			if (!lockedBaselines[item.id]) {
				lockedBaselines[item.id] = baseline;
			}

			if (
				item.x !== baseline.x ||
				item.y !== baseline.y ||
				item.w !== baseline.w ||
				item.h !== baseline.h
			) {
				changed = true;
				return { ...item, ...baseline, locked: true };
			}

			return item;
		});

		return changed;
	}

	function handleGridChange() {
		enforceLockedPositions();

		if (layoutHasOverlaps(items)) {
			restoreInteractionLayout();
			return;
		}

		interactionBaseline = null;
		lastValidLayout = cloneDashboardLayout(items);
		scheduleSave();
	}

	function scheduleSave() {
		if (!layoutReady) return;

		const serialized = JSON.stringify(toSavedLayout(items));
		if (serialized === lastSaved) return;

		clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			try {
				await client.mutation(api.domains.dashboard.layout.saveLayout, {
					layout: toSavedLayout(items)
				});
				lastSaved = serialized;
			} catch {
				// Layout stays optimistic locally; next change will retry.
			}
		}, 500);
	}

	function toggleLock(id: DashboardWidgetId) {
		items = items.map((item) => {
			if (item.id !== id) return item;

			const locked = !item.locked;
			if (locked) {
				lockedBaselines[id] = { x: item.x, y: item.y, w: item.w, h: item.h };
			} else {
				delete lockedBaselines[id];
			}

			return { ...item, locked };
		});
		lastValidLayout = cloneDashboardLayout(items);
		scheduleSave();
	}

	function widgetTitle(id: DashboardWidgetId) {
		return widgetLabels[id];
	}
</script>

{#if layoutQuery.isLoading}
	<p class="text-sm text-muted-foreground">Loading dashboard layout...</p>
{:else}
	<div class="w-full">
		<Grid
			cols={12}
			{itemSize}
			gap={12}
			collision="push"
			class="dashboard-grid relative min-h-[520px] w-full min-w-[640px]"
		>
			{#each items as item (item.id)}
				<GridItem
					id={item.id}
					bind:x={item.x}
					bind:y={item.y}
					bind:w={item.w}
					bind:h={item.h}
					min={{ w: 3, h: 2 }}
					movable={!item.locked}
					resizable={!item.locked}
					onchange={handleGridChange}
					class="dashboard-grid-item overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm {item.locked
						? 'ring-1 ring-primary/20'
						: ''}"
					activeClass="ring-2 ring-primary/40 shadow-md"
					previewClass="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5"
					resizerClass="grid-resizer"
				>
					{#snippet moveHandle({ moveStart })}
						{#if !item.locked}
							<button
								type="button"
								class="absolute inset-x-0 top-0 z-10 flex h-8 cursor-grab items-center justify-center gap-1.5 border-b border-border/60 bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/5 pr-10 active:cursor-grabbing"
								aria-label="Drag {widgetTitle(item.id)} widget"
								onpointerdown={(event) => {
									beginInteraction();
									moveStart(event);
								}}
							>
								<GripVertical class="size-4 text-primary/70" />
								<span class="text-xs font-medium text-muted-foreground"
									>{widgetTitle(item.id)}</span
								>
							</button>
						{/if}
					{/snippet}

					{#snippet children()}
						<button
							type="button"
							class="absolute top-1.5 right-2 z-20 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground {item.locked
								? 'text-primary'
								: ''}"
							aria-label={item.locked ? 'Unlock widget' : 'Lock widget in place'}
							title={item.locked ? 'Unlock widget' : 'Lock widget in place'}
							onclick={() => toggleLock(item.id)}
						>
							{#if item.locked}
								<Lock class="size-3.5" />
							{:else}
								<Unlock class="size-3.5" />
							{/if}
						</button>

						{#if item.locked}
							<div
								class="absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-center gap-1.5 border-b border-border/60 bg-muted/40 pr-10"
							>
								<Lock class="size-3.5 text-primary/70" />
								<span class="text-xs font-medium text-muted-foreground"
									>{widgetTitle(item.id)}</span
								>
							</div>
						{/if}

						<div class="flex h-full min-h-0 flex-col overflow-hidden pt-8">
							{#if item.id === 'attention-feed'}
								<AttentionFeedWidget />
							{:else if item.id === 'finance'}
								<FinanceWidget />
							{:else}
								<TasksWidget />
							{/if}
						</div>
					{/snippet}
				</GridItem>
			{/each}
		</Grid>
	</div>
{/if}

<style>
	:global(.dashboard-grid .dashboard-grid-item) {
		transition:
			left 0.85s cubic-bezier(0.22, 1, 0.36, 1),
			top 0.85s cubic-bezier(0.22, 1, 0.36, 1),
			width 0.85s cubic-bezier(0.22, 1, 0.36, 1),
			height 0.85s cubic-bezier(0.22, 1, 0.36, 1);
	}

	:global(.dashboard-grid .active-default),
	:global(.dashboard-grid .dashboard-grid-item.ring-2) {
		transition: none;
	}

	:global(.grid-resizer) {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 16px;
		height: 16px;
		cursor: se-resize;
		background: linear-gradient(135deg, transparent 50%, oklch(0.62 0.19 48 / 0.45) 50%);
		border-bottom-right-radius: 0.75rem;
	}
</style>
