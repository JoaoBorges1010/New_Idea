export type ExtractPdfTextParams = {
	bytes: ArrayBuffer;
};

export type ExtractPdfTextResult =
	| { success: true; text: string }
	| { success: false; error: string };

export async function extractPdfText(params: ExtractPdfTextParams): Promise<ExtractPdfTextResult> {
	try {
		const { PDFParse } = await import('pdf-parse');
		const parser = new PDFParse({ data: new Uint8Array(params.bytes) });
		const result = await parser.getText();
		await parser.destroy();

		const text = result.text.trim();
		if (text.length === 0) {
			return { success: false, error: 'No text could be extracted from the PDF' };
		}

		return { success: true, text };
	} catch {
		return { success: false, error: 'Failed to extract text from PDF' };
	}
}
