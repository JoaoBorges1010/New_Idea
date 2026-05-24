<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const client = useConvexClient();
	const payments = useQuery(api.domains.bills.processing.listPendingPayments, {});
	const documents = useQuery(api.domains.documents.vault.listDocuments, { category: 'bill' });

	let selectedDocumentId = $state<Id<'documents'> | ''>('');
	let processing = $state(false);
	let message = $state('');
	let error = $state('');

	async function processBill(event: Event) {
		event.preventDefault();
		if (!selectedDocumentId) return;

		processing = true;
		message = '';
		error = '';

		try {
			const result = await client.action(api.domains.bills.processing.processBillUpload, {
				documentId: selectedDocumentId as Id<'documents'>
			});

			if (result.success) {
				message = 'Bill processed. Pending payment created.';
				selectedDocumentId = '';
			} else {
				error = result.error;
			}
		} catch {
			error = 'Failed to process bill.';
		} finally {
			processing = false;
		}
	}

	async function markReviewed(paymentId: Id<'pendingPayments'>) {
		await client.mutation(api.domains.bills.processing.updatePaymentStatus, {
			paymentId,
			status: 'reviewed'
		});
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-medium tracking-tight">Bills</h1>
		<p class="mt-1 text-muted-foreground">AI-assisted bill parsing and pending payments.</p>
	</div>

	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title>Process a bill</Card.Title>
			<Card.Description>
				Upload a bill PDF in the Vault first, then select it here for AI extraction.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="space-y-4" onsubmit={processBill}>
				<div class="space-y-2">
					<Label for="document">Bill document</Label>
					<select
						id="document"
						bind:value={selectedDocumentId}
						required
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<option value="">Select a document</option>
						{#each documents.data ?? [] as document (document._id)}
							<option value={document._id}>{document.fileName}</option>
						{/each}
					</select>
				</div>
				{#if message}
					<p class="text-sm text-primary">{message}</p>
				{/if}
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Button type="submit" disabled={processing} class="rounded-full">
					{processing ? 'Processing...' : 'Extract bill details'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<section class="space-y-3">
		<h2 class="text-xl font-medium tracking-tight">Pending payments</h2>
		{#if payments.isLoading}
			<p class="text-muted-foreground">Loading payments...</p>
		{:else if payments.error}
			<p class="text-destructive">Failed to load payments.</p>
		{:else if !payments.data?.length}
			<p class="text-muted-foreground">No pending payments yet.</p>
		{:else}
			<Card.Root class="rounded-2xl">
				<Card.Content class="divide-y divide-border p-0">
					{#each payments.data as payment (payment._id)}
						<div class="flex items-center justify-between px-4 py-3">
							<div>
								<p class="font-medium">{payment.vendorName}</p>
								<p class="text-sm text-muted-foreground">
									${payment.amountDue.toFixed(2)} · due {new Date(
										payment.dueDate
									).toLocaleDateString()}
								</p>
								<Badge variant="secondary" class="mt-1 capitalize">{payment.status}</Badge>
							</div>
							{#if payment.status === 'pending'}
								<Button
									variant="outline"
									size="sm"
									class="rounded-full"
									onclick={() => markReviewed(payment._id)}
								>
									Mark reviewed
								</Button>
							{/if}
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		{/if}
	</section>
</div>
