<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const auth = useAuth();
	const client = useConvexClient();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let familyName = $state('My Family');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			await auth.signIn('password', { email, password, flow: 'signUp', name });
			await client.mutation(api.domains.families.members.createFamily, {
				name: familyName,
				displayName: name
			});
			await goto(resolve('/dashboard'));
		} catch {
			error = 'Sign up failed. The email may already be in use.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
	<Card.Root class="rounded-2xl shadow-sm">
		<Card.Header>
			<Card.Title class="text-2xl tracking-tight">Create account</Card.Title>
			<Card.Description>Set up your FamilyOS household.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="space-y-4" onsubmit={handleSubmit}>
				<div class="space-y-2">
					<Label for="name">Your name</Label>
					<Input id="name" type="text" required bind:value={name} />
				</div>
				<div class="space-y-2">
					<Label for="familyName">Family name</Label>
					<Input id="familyName" type="text" required bind:value={familyName} />
				</div>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" required bind:value={email} />
				</div>
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" required minlength={8} bind:value={password} />
				</div>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Button type="submit" disabled={submitting} class="w-full rounded-full">
					{submitting ? 'Creating account...' : 'Create account'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Already have an account?
				<Button href={resolve('/auth/login')} variant="link" class="px-1">Sign in</Button>
			</p>
		</Card.Footer>
	</Card.Root>
</section>
