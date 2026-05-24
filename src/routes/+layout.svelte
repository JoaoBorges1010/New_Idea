<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	setupConvexAuth({ getServerState: () => data.authState });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
