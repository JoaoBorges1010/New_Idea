<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { Button } from '$lib/components/ui/button/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	const isLoading = $derived(auth.isLoading);

	let { children } = $props();
</script>

{#if isLoading}
	<div class="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>
{:else if isAuthenticated}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			<header
				class="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md"
			>
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4!" />
				<p class="text-sm font-medium capitalize text-muted-foreground">
					{$page.url.pathname.split('/').filter(Boolean)[0] ?? 'Home'}
				</p>
			</header>
			<main class="flex-1 p-6">
				{@render children()}
			</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
{:else}
	<div class="flex min-h-screen items-center justify-center px-6">
		<div class="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
			<p class="text-muted-foreground">Please sign in to access FamilyOS.</p>
			<Button href={resolve('/auth/login')} class="mt-4 rounded-full">Go to sign in</Button>
		</div>
	</div>
{/if}
