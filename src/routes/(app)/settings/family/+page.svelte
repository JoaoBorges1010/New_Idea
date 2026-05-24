<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

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
		<h1 class="text-3xl font-medium tracking-tight">Family settings</h1>
		<p class="mt-1 text-muted-foreground">
			{#if currentUser.data?.family}
				Managing {currentUser.data.family.name}
			{:else}
				Loading family...
			{/if}
		</p>
	</div>

	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title>Add member</Card.Title>
		</Card.Header>
		<Card.Content>
			<form class="space-y-4" onsubmit={addMember}>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<Input id="name" type="text" required bind:value={name} />
					</div>
					<div class="space-y-2">
						<Label for="role">Role</Label>
						<select
							id="role"
							bind:value={role}
							class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							<option value="adult">Adult</option>
							<option value="child">Child</option>
						</select>
					</div>
				</div>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Button type="submit" class="rounded-full">Add member</Button>
			</form>
		</Card.Content>
	</Card.Root>

	{#if members.isLoading}
		<p class="text-muted-foreground">Loading members...</p>
	{:else if members.error}
		<p class="text-destructive">Failed to load members.</p>
	{:else}
		<Card.Root class="rounded-2xl">
			<Card.Content class="divide-y divide-border p-0">
				{#each members.data ?? [] as member (member._id)}
					<div class="px-4 py-3">
						<p class="font-medium">{member.name}</p>
						<p class="text-sm text-muted-foreground capitalize">{member.role}</p>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
