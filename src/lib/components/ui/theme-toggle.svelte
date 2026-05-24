<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';

	let isDark = $derived(mode.current === 'dark');
</script>

<Button
	variant="outline"
	size="icon"
	class="rounded-full"
	onclick={toggleMode}
	aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
>
	{#if isDark}
		<Sun class="size-4" />
	{:else}
		<Moon class="size-4" />
	{/if}
</Button>
