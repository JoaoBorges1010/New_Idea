<script lang="ts">
	import Grid, { GridItem } from '@appulsauce/svelte-grid';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import AttentionFeedWidget from '$lib/components/dashboard/widgets/attention-feed-widget.svelte';
	import FinanceWidget from '$lib/components/dashboard/widgets/finance-widget.svelte';
	import TasksWidget from '$lib/components/dashboard/widgets/tasks-widget.svelte';
	import {
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

	const widgetLabels: Record<DashboardWidgetId, string> = {
		'attention-feed': 'Attention feed',
		finance: 'Finance',
		tasks: 'Tasks'
	};

	const itemSize = { height: 96 };

	$effect(() => {
		if (layoutQuery.data !== undefined && !layoutReady) {
			items = mergeDashboardLayout(layoutQuery.data);
			lastSaved = JSON.stringify(toSavedLayout(items));
			layoutReady = true;
		}
	});

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

	function widgetTitle(id: DashboardWidgetId) {
		return widgetLabels[id];
	}
</script>

{#if layoutQuery.isLoading}
	<p class="text-sm text-muted-foreground">Loading dashboard layout...</p>
{:else}
	<div class="w-full overflow-x-auto">
		<Grid
			cols={12}
			{itemSize}
			gap={12}
			collision="push"
			class="relative min-h-[520px] w-full min-w-[640px]"
		>
			{#each items as item (item.id)}
				<GridItem
					id={item.id}
					bind:x={item.x}
					bind:y={item.y}
					bind:w={item.w}
					bind:h={item.h}
					min={{ w: 3, h: 2 }}
					onchange={scheduleSave}
					class="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
					activeClass="ring-2 ring-primary/40 shadow-md"
					previewClass="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5"
					resizerClass="grid-resizer"
				>
					{#snippet moveHandle({ moveStart })}
						<button
							type="button"
							class="absolute inset-x-0 top-0 z-10 flex h-8 cursor-grab items-center justify-center gap-1.5 border-b border-border/60 bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/5 active:cursor-grabbing"
							aria-label="Drag {widgetTitle(item.id)} widget"
							onpointerdown={moveStart}
						>
							<GripVertical class="size-4 text-primary/70" />
							<span class="text-xs font-medium text-muted-foreground">{widgetTitle(item.id)}</span>
						</button>
					{/snippet}

					{#snippet children()}
						<div class="h-full pt-8">
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
