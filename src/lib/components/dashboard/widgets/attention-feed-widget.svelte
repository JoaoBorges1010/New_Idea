<script lang="ts">
	import { resolve } from '$app/paths';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const feed = useQuery(api.domains.dashboard.feed.getAttentionFeed, {});
</script>

<Card.Root class="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 shadow-none">
	<Card.Header class="shrink-0 pb-3">
		<Card.Title class="text-base">Attention feed</Card.Title>
		<Card.Description>What needs your attention this week.</Card.Description>
	</Card.Header>
	<Card.Content class="min-h-0 flex-1">
		{#if feed.isLoading}
			<p class="text-sm text-muted-foreground">Loading attention feed...</p>
		{:else if feed.error}
			<p class="text-sm text-destructive">Failed to load dashboard feed.</p>
		{:else if !feed.data?.length}
			<div class="rounded-xl border border-dashed border-border py-8 text-center">
				<p class="font-medium">All clear for now</p>
				<p class="mt-1 text-sm text-muted-foreground">
					Upload a bill or document to see items here.
				</p>
			</div>
		{:else}
			<ul class="space-y-2">
				{#each feed.data as item (item.id)}
					<li class="rounded-xl border border-border bg-muted/30 p-3">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<Badge variant="secondary" class="capitalize">{item.domain}</Badge>
								<p class="mt-1.5 text-sm font-medium">{item.title}</p>
								{#if item.dueDate}
									<p class="mt-0.5 text-xs text-muted-foreground">
										{new Date(item.dueDate).toLocaleDateString()}
									</p>
								{/if}
							</div>
							<Button
								href={resolve(item.href as '/bills')}
								variant="outline"
								size="sm"
								class="shrink-0 rounded-full"
							>
								View
							</Button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</Card.Content>
</Card.Root>
