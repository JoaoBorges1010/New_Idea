<script lang="ts">
	import DashboardGrid from '$lib/components/dashboard/dashboard-grid.svelte';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-medium tracking-tight">Dashboard</h1>
		<p class="mt-1 text-muted-foreground">
			Drag widgets by the handle to rearrange your workspace. Layout syncs across devices.
		</p>
	</div>

	<DashboardGrid />
</div>
