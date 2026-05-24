import type { GenericActionCtx } from 'convex/server';
import type { DataModel, Id } from '../../_generated/dataModel';

type StorageCtx = Pick<GenericActionCtx<DataModel>, 'storage'>;

export type StoreDocumentFileParams = {
	ctx: StorageCtx;
	bytes: ArrayBuffer;
	contentType: string;
};

export type StoreDocumentFileResult =
	| { success: true; storageId: Id<'_storage'> }
	| { success: false; error: string };

export async function storeDocumentFile(
	params: StoreDocumentFileParams
): Promise<StoreDocumentFileResult> {
	try {
		const blob = new Blob([params.bytes], { type: params.contentType });
		const storageId = await params.ctx.storage.store(blob);
		return { success: true, storageId };
	} catch {
		return { success: false, error: 'Failed to store document file' };
	}
}

export type GetDocumentUrlParams = {
	ctx: StorageCtx;
	storageId: Id<'_storage'>;
};

export async function getDocumentUrl(params: GetDocumentUrlParams): Promise<string | null> {
	return await params.ctx.storage.getUrl(params.storageId);
}
