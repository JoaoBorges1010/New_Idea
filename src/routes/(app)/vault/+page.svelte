<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const client = useConvexClient();
	const documents = useQuery(api.domains.documents.vault.listDocuments, {});

	let fileInput = $state<HTMLInputElement | null>(null);
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

			if (!uploadResponse.ok) throw new Error('Upload failed');

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
		<h1 class="text-3xl font-medium tracking-tight">Document Vault</h1>
		<p class="mt-1 text-muted-foreground">
			Shared storage for bills, receipts, contracts, and more.
		</p>
	</div>

	<Card.Root class="rounded-2xl">
		<Card.Header>
			<Card.Title>Upload</Card.Title>
		</Card.Header>
		<Card.Content>
			<form class="space-y-4" onsubmit={handleUpload} enctype="multipart/form-data">
				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2 md:col-span-2">
						<Label for="file">File</Label>
						<Input bind:ref={fileInput} id="file" type="file" accept=".pdf,image/*" required />
					</div>
					<div class="space-y-2">
						<Label for="category">Category</Label>
						<select
							id="category"
							bind:value={category}
							class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							<option value="bill">Bill</option>
							<option value="receipt">Receipt</option>
							<option value="contract">Contract</option>
							<option value="other">Other</option>
						</select>
					</div>
				</div>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
				<Button type="submit" disabled={uploading} class="rounded-full">
					{uploading ? 'Uploading...' : 'Upload document'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	{#if documents.isLoading}
		<p class="text-muted-foreground">Loading documents...</p>
	{:else if documents.error}
		<p class="text-destructive">Failed to load documents.</p>
	{:else if !documents.data?.length}
		<p class="text-muted-foreground">No documents uploaded yet.</p>
	{:else}
		<Card.Root class="rounded-2xl">
			<Card.Content class="divide-y divide-border p-0">
				{#each documents.data as document (document._id)}
					<div class="flex items-center justify-between px-4 py-3">
						<div>
							<p class="font-medium">{document.fileName}</p>
							<p class="text-sm text-muted-foreground">
								{document.category} · {new Date(document.uploadedAt).toLocaleDateString()}
							</p>
						</div>
						<Button variant="ghost" size="sm" onclick={() => openDocument(document._id)}>
							Open
						</Button>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
