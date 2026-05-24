<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import FolderLock from '@lucide/svelte/icons/folder-lock';
	import Receipt from '@lucide/svelte/icons/receipt';
	import Users from '@lucide/svelte/icons/users';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ThemeToggle from '$lib/components/ui/theme-toggle.svelte';

	const auth = useAuth();

	const navItems: Array<{
		href: string;
		label: string;
		icon: typeof LayoutDashboard;
		disabled?: boolean;
	}> = [
		{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/vault', label: 'Vault', icon: FolderLock },
		{ href: '/bills', label: 'Bills', icon: Receipt },
		{ href: '/settings/family', label: 'Family', icon: Users },
		{ href: '/finance', label: 'Finance', icon: TrendingUp, disabled: true }
	];
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="border-b border-sidebar-border px-4 py-4">
		<div class="flex items-center gap-2 overflow-hidden">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground"
			>
				F
			</div>
			<div class="min-w-0 group-data-[collapsible=icon]:hidden">
				<p class="truncate text-sm font-semibold tracking-tight text-sidebar-primary">FamilyOS</p>
				<p class="truncate text-xs text-muted-foreground">Household platform</p>
			</div>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navItems as item (item.href)}
						<Sidebar.MenuItem>
							{#if item.disabled}
								<div
									class="flex h-8 w-full cursor-not-allowed items-center gap-2 rounded-md p-2 text-sm opacity-50"
								>
									<item.icon class="size-4 shrink-0" />
									<span>{item.label}</span>
								</div>
							{:else}
								<Sidebar.MenuButton
									isActive={$page.url.pathname.startsWith(item.href)}
									tooltipContent={item.label}
									class="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
								>
									{#snippet child({ props })}
										<a href={resolve(item.href as '/dashboard')} {...props}>
											<item.icon />
											<span>{item.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							{/if}
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="border-t border-sidebar-border p-2">
		<div class="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
			<ThemeToggle />
			<Button
				variant="outline"
				size="sm"
				class="flex-1 group-data-[collapsible=icon]:hidden"
				onclick={() => auth.signOut()}
			>
				Sign out
			</Button>
		</div>
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
