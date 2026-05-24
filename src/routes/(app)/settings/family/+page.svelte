<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	const client = useConvexClient();
	const members = useQuery(api.domains.families.members.listMembers, {});
	const currentUser = useQuery(api.domains.families.members.getCurrentUser, {});

	let name = $state('');
	let role = $state<'adult' | 'child'>('adult');
	let error = $state('');

	async function addMember(event: Event) {
		event.preventDefault();
		error = '';

		try {
			await client.mutation(api.domains.families.members.addMember, { name, role });
			name = '';
		} catch {
			error = 'Failed to add family member.';
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Family settings</h1>
		<p class="mt-1 text-sm text-slate-600">
			{#if currentUser.data?.family}
				Managing {currentUser.data.family.name}
			{:else}
				Loading family...
			{/if}
		</p>
	</div>

	<form class="rounded-xl border border-slate-200 bg-white p-5" onsubmit={addMember}>
		<h2 class="font-medium text-slate-900">Add member</h2>
		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Name</span>
				<input
					type="text"
					required
					bind:value={name}
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
				/>
			</label>
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Role</span>
				<select bind:value={role} class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
					<option value="adult">Adult</option>
					<option value="child">Child</option>
				</select>
			</label>
		</div>
		{#if error}
			<p class="mt-3 text-sm text-red-600">{error}</p>
		{/if}
		<button
			type="submit"
			class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
		>
			Add member
		</button>
	</form>

	{#if members.isLoading}
		<p class="text-slate-500">Loading members...</p>
	{:else if members.error}
		<p class="text-red-600">Failed to load members.</p>
	{:else}
		<ul class="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
			{#each members.data ?? [] as member (member._id)}
				<li class="px-4 py-3">
					<p class="font-medium text-slate-900">{member.name}</p>
					<p class="text-sm capitalize text-slate-500">{member.role}</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>
