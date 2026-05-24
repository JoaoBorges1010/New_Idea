<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel.js';

	const client = useConvexClient();
	const documents = useQuery(api.domains.documents.vault.listDocuments, {});

	let fileInput: HTMLInputElement | undefined = $state();
	let uploading = $state(false);
	let error = $state('');
	let category = $state('other');

	async function handleUpload(event: Event) {
		event.preventDefault();
		const file = fileInput?.files?.[0];
		if (!file) return;

		uploading = true;
		error = '';

		try {
			const uploadUrl = await client.mutation(api.domains.documents.vault.generateUploadUrl, {});
			const uploadResponse = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': file.type },
				body: file
			});

			if (!uploadResponse.ok) {
				throw new Error('Upload failed');
			}

			const { storageId } = (await uploadResponse.json()) as { storageId: Id<'_storage'> };

			await client.mutation(api.domains.documents.vault.saveDocumentMetadata, {
				storageId,
				fileName: file.name,
				mimeType: file.type || 'application/octet-stream',
				category,
				tags: []
			});

			if (fileInput) fileInput.value = '';
		} catch {
			error = 'Failed to upload document.';
		} finally {
			uploading = false;
		}
	}

	async function openDocument(documentId: Id<'documents'>) {
		const url = await client.query(api.domains.documents.vault.getDocumentUrlQuery, { documentId });
		if (url) window.open(url, '_blank');
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Document Vault</h1>
		<p class="mt-1 text-sm text-slate-600">
			Shared storage for bills, receipts, contracts, and more.
		</p>
	</div>

	<form
		class="rounded-xl border border-slate-200 bg-white p-5"
		onsubmit={handleUpload}
		enctype="multipart/form-data"
	>
		<div class="grid gap-4 md:grid-cols-3">
			<label class="block md:col-span-2">
				<span class="text-sm font-medium text-slate-700">File</span>
				<input
					bind:this={fileInput}
					type="file"
					accept=".pdf,image/*"
					required
					class="mt-1 block w-full text-sm"
				/>
			</label>
			<label class="block">
				<span class="text-sm font-medium text-slate-700">Category</span>
				<select
					bind:value={category}
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
				>
					<option value="bill">Bill</option>
					<option value="receipt">Receipt</option>
					<option value="contract">Contract</option>
					<option value="other">Other</option>
				</select>
			</label>
		</div>
		{#if error}
			<p class="mt-3 text-sm text-red-600">{error}</p>
		{/if}
		<button
			type="submit"
			disabled={uploading}
			class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
		>
			{uploading ? 'Uploading...' : 'Upload document'}
		</button>
	</form>

	{#if documents.isLoading}
		<p class="text-slate-500">Loading documents...</p>
	{:else if documents.error}
		<p class="text-red-600">Failed to load documents.</p>
	{:else if !documents.data?.length}
		<p class="text-slate-500">No documents uploaded yet.</p>
	{:else}
		<ul class="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
			{#each documents.data as document (document._id)}
				<li class="flex items-center justify-between px-4 py-3">
					<div>
						<p class="font-medium text-slate-900">{document.fileName}</p>
						<p class="text-sm text-slate-500">
							{document.category} · {new Date(document.uploadedAt).toLocaleDateString()}
						</p>
					</div>
					<button
						type="button"
						class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
						onclick={() => openDocument(document._id)}
					>
						Open
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
