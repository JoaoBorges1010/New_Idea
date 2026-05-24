export type ParseDocumentParams = {
	content: string;
	systemPrompt: string;
	schemaDescription: string;
};

export type ParseDocumentResult =
	| { success: true; data: Record<string, unknown> }
	| { success: false; error: string };

export async function parseDocument(params: ParseDocumentParams): Promise<ParseDocumentResult> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return { success: false, error: 'OPENAI_API_KEY is not configured' };
	}

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: params.systemPrompt },
					{
						role: 'user',
						content: `${params.schemaDescription}\n\nDocument content:\n${params.content}`
					}
				]
			})
		});

		if (!response.ok) {
			return { success: false, error: 'AI provider request failed' };
		}

		const payload = (await response.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};

		const content = payload.choices?.[0]?.message?.content;
		if (!content) {
			return { success: false, error: 'AI provider returned an empty response' };
		}

		return { success: true, data: JSON.parse(content) as Record<string, unknown> };
	} catch {
		return { success: false, error: 'Failed to parse document with AI' };
	}
}
