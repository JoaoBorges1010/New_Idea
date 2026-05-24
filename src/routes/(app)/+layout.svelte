<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from '$lib/components/ui/button/index.js';
	import ThemeToggle from '$lib/components/ui/theme-toggle.svelte';

	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	const isLoading = $derived(auth.isLoading);

	let { children } = $props();

	const navItems: Array<{ href: string; label: string; disabled?: boolean }> = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/vault', label: 'Vault' },
		{ href: '/bills', label: 'Bills' },
		{ href: '/settings/family', label: 'Family' },
		{ href: '/finance', label: 'Finance', disabled: true }
	];
</script>

{#if isLoading}
	<div class="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>
{:else if isAuthenticated}
	<div class="min-h-screen bg-background">
		<header class="sticky top-0 z-40 px-4 pt-4">
			<div
				class="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm backdrop-blur-md"
			>
				<div>
					<p class="text-sm font-semibold tracking-tight text-primary">FamilyOS</p>
					<p class="text-xs text-muted-foreground">Household platform</p>
				</div>
				<nav class="flex items-center gap-1 md:gap-3">
					{#each navItems as item (item.href)}
						{#if item.disabled}
							<span class="cursor-not-allowed px-2 text-sm text-muted-foreground/50"
								>{item.label}</span
							>
						{:else}
							<a
								href={resolve(item.href as '/dashboard')}
								class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
									item.href
								)
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								{item.label}
							</a>
						{/if}
					{/each}
					<ThemeToggle />
					<Button variant="outline" size="sm" class="rounded-full" onclick={() => auth.signOut()}>
						Sign out
					</Button>
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-6xl px-6 py-8">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center px-6">
		<div class="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
			<p class="text-muted-foreground">Please sign in to access FamilyOS.</p>
			<Button href={resolve('/auth/login')} class="mt-4 rounded-full">Go to sign in</Button>
		</div>
	</div>
{/if}
