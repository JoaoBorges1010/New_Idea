<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

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
	<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
		<h1 class="text-2xl font-semibold text-slate-900">Create account</h1>
		<p class="mt-2 text-sm text-slate-600">Set up your FamilyOS household.</p>

		<form class="mt-6 space-y-4" onsubmit={handleSubmit}>
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Your name</span>
				<input
					type="text"
					required
					bind:value={name}
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
				/>
			</label>
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Family name</span>
				<input
					type="text"
					required
					bind:value={familyName}
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
				/>
			</label>
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Email</span>
				<input
					type="email"
					required
					bind:value={email}
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
				/>
			</label>
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Password</span>
				<input
					type="password"
					required
					minlength="8"
					bind:value={password}
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
				/>
			</label>
			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
			>
				{submitting ? 'Creating account...' : 'Create account'}
			</button>
		</form>

		<p class="mt-4 text-sm text-slate-600">
			Already have an account?
			<a href={resolve('/auth/login')} class="font-medium text-indigo-600">Sign in</a>
		</p>
	</div>
</section>
