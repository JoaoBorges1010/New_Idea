<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel.js';

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
		<h1 class="text-2xl font-semibold text-slate-900">Bills</h1>
		<p class="mt-1 text-sm text-slate-600">AI-assisted bill parsing and pending payments.</p>
	</div>

	<form class="rounded-xl border border-slate-200 bg-white p-5" onsubmit={processBill}>
		<h2 class="font-medium text-slate-900">Process a bill</h2>
		<p class="mt-1 text-sm text-slate-500">
			Upload a bill PDF in the Vault first, then select it here for AI extraction.
		</p>
		<label class="mt-4 block">
			<span class="text-sm font-medium text-slate-700">Bill document</span>
			<select
				bind:value={selectedDocumentId}
				required
				class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
			>
				<option value="">Select a document</option>
				{#each documents.data ?? [] as document (document._id)}
					<option value={document._id}>{document.fileName}</option>
				{/each}
			</select>
		</label>
		{#if message}
			<p class="mt-3 text-sm text-green-700">{message}</p>
		{/if}
		{#if error}
			<p class="mt-3 text-sm text-red-600">{error}</p>
		{/if}
		<button
			type="submit"
			disabled={processing}
			class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
		>
			{processing ? 'Processing...' : 'Extract bill details'}
		</button>
	</form>

	<section>
		<h2 class="font-medium text-slate-900">Pending payments</h2>
		{#if payments.isLoading}
			<p class="mt-2 text-slate-500">Loading payments...</p>
		{:else if payments.error}
			<p class="mt-2 text-red-600">Failed to load payments.</p>
		{:else if !payments.data?.length}
			<p class="mt-2 text-slate-500">No pending payments yet.</p>
		{:else}
			<ul class="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
				{#each payments.data as payment (payment._id)}
					<li class="flex items-center justify-between px-4 py-3">
						<div>
							<p class="font-medium text-slate-900">{payment.vendorName}</p>
							<p class="text-sm text-slate-500">
								${payment.amountDue.toFixed(2)} · due {new Date(
									payment.dueDate
								).toLocaleDateString()}
								· {payment.status}
							</p>
						</div>
						{#if payment.status === 'pending'}
							<button
								type="button"
								class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
								onclick={() => markReviewed(payment._id)}
							>
								Mark reviewed
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
