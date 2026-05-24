<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const auth = useAuth();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		try {
			await auth.signIn('password', { email, password, flow: 'signIn' });
			const redirectTo = $page.url.searchParams.get('redirectTo') ?? '/dashboard';
			await goto(
				redirectTo.startsWith('/') ? resolve(redirectTo as '/dashboard') : resolve('/dashboard')
			);
		} catch {
			error = 'Sign in failed. Check your email and password.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
	<Card.Root class="rounded-2xl shadow-sm">
		<Card.Header>
			<Card.Title class="text-2xl tracking-tight">Sign in</Card.Title>
			<Card.Description>Access your FamilyOS household platform.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="space-y-4" onsubmit={handleSubmit}>
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
					{submitting ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				No account?
				<Button href={resolve('/auth/signup')} variant="link" class="px-1">Create one</Button>
			</p>
		</Card.Footer>
	</Card.Root>
</section>
