<script lang="ts">
	import { resolve } from '$app/paths';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const feed = useQuery(api.domains.dashboard.feed.getAttentionFeed, {});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-medium tracking-tight">Dashboard</h1>
		<p class="mt-1 text-muted-foreground">What needs your attention this week.</p>
	</div>

	{#if feed.isLoading}
		<p class="text-muted-foreground">Loading attention feed...</p>
	{:else if feed.error}
		<p class="text-destructive">Failed to load dashboard feed.</p>
	{:else if !feed.data?.length}
		<Card.Root class="rounded-2xl border-dashed">
			<Card.Content class="py-10 text-center">
				<p class="font-medium">All clear for now</p>
				<p class="mt-1 text-sm text-muted-foreground">
					Upload a bill or document to see items here.
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<ul class="space-y-3">
			{#each feed.data as item (item.id)}
				<Card.Root class="rounded-2xl">
					<Card.Content class="flex items-start justify-between gap-4 py-4">
						<div>
							<Badge variant="secondary" class="capitalize">{item.domain}</Badge>
							<p class="mt-2 font-medium">{item.title}</p>
							{#if item.dueDate}
								<p class="mt-1 text-sm text-muted-foreground">
									{new Date(item.dueDate).toLocaleDateString()}
								</p>
							{/if}
						</div>
						<Button
							href={resolve(item.href as '/bills')}
							variant="outline"
							size="sm"
							class="rounded-full"
						>
							View
						</Button>
					</Card.Content>
				</Card.Root>
			{/each}
		</ul>
	{/if}

	<section class="grid gap-4 md:grid-cols-2">
		<Card.Root class="rounded-2xl">
			<Card.Header>
				<Card.Title>Finance</Card.Title>
				<Card.Description>Credit scores, loans, and budgets — coming soon.</Card.Description>
			</Card.Header>
		</Card.Root>
		<Card.Root class="rounded-2xl">
			<Card.Header>
				<Card.Title>Tasks</Card.Title>
				<Card.Description>Member chores and reminders — coming soon.</Card.Description>
			</Card.Header>
		</Card.Root>
	</section>
</div>
