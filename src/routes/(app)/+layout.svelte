<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	const isLoading = $derived(auth.isLoading);

	let { children } = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/vault', label: 'Vault' },
		{ href: '/bills', label: 'Bills' },
		{ href: '/settings/family', label: 'Family' },
		{ href: '/finance', label: 'Finance', disabled: true }
	];
</script>

{#if isLoading}
	<div class="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>
{:else if isAuthenticated}
	<div class="min-h-screen bg-slate-50">
		<header class="border-b border-slate-200 bg-white">
			<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<div>
					<p class="text-sm font-semibold text-indigo-600">FamilyOS</p>
					<p class="text-xs text-slate-500">Multi-domain household platform</p>
				</div>
				<nav class="flex items-center gap-4">
					{#each navItems as item (item.href)}
						{#if item.disabled}
							<span class="cursor-not-allowed text-sm text-slate-300">{item.label}</span>
						{:else}
							<a
								href={resolve(item.href)}
								class="text-sm font-medium {$page.url.pathname.startsWith(item.href)
									? 'text-indigo-600'
									: 'text-slate-600 hover:text-slate-900'}"
							>
								{item.label}
							</a>
						{/if}
					{/each}
					<button
						type="button"
						class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
						onclick={() => auth.signOut()}
					>
						Sign out
					</button>
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-6xl px-6 py-8">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center px-6">
		<div class="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
			<p class="text-slate-600">Please sign in to access FamilyOS.</p>
			<a
				href={resolve('/auth/login')}
				class="mt-4 inline-block text-sm font-medium text-indigo-600"
			>
				Go to sign in
			</a>
		</div>
	</div>
{/if}
