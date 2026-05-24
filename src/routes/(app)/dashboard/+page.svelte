<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	const feed = useQuery(api.domains.dashboard.feed.getAttentionFeed, {});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
		<p class="mt-1 text-sm text-slate-600">What needs your attention this week.</p>
	</div>

	{#if feed.isLoading}
		<p class="text-slate-500">Loading attention feed...</p>
	{:else if feed.error}
		<p class="text-red-600">Failed to load dashboard feed.</p>
	{:else if !feed.data?.length}
		<div class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
			<p class="font-medium text-slate-700">All clear for now</p>
			<p class="mt-1 text-sm text-slate-500">
				Upload a bill or document to see items here.
			</p>
		</div>
	{:else}
		<ul class="space-y-3">
			{#each feed.data as item (item.id)}
				<li class="rounded-xl border border-slate-200 bg-white p-4">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-xs font-medium uppercase tracking-wide text-slate-400">
								{item.domain}
							</p>
							<p class="mt-1 font-medium text-slate-900">{item.title}</p>
							{#if item.dueDate}
								<p class="mt-1 text-sm text-slate-500">
									{new Date(item.dueDate).toLocaleDateString()}
								</p>
							{/if}
						</div>
						<a href={item.href} class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
							View
						</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	<section class="grid gap-4 md:grid-cols-2">
		<div class="rounded-xl border border-slate-200 bg-white p-5">
			<h2 class="font-medium text-slate-900">Finance</h2>
			<p class="mt-1 text-sm text-slate-500">Credit scores, loans, and budgets — coming soon.</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-5">
			<h2 class="font-medium text-slate-900">Tasks</h2>
			<p class="mt-1 text-sm text-slate-500">Member chores and reminders — coming soon.</p>
		</div>
	</section>
</div>
