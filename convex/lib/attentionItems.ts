export type AttentionDomain = 'bills' | 'documents' | 'finance' | 'tasks';

export type AttentionPriority = 'low' | 'medium' | 'high';

export type AttentionItem = {
	id: string;
	domain: AttentionDomain;
	title: string;
	dueDate?: number;
	priority: AttentionPriority;
	href: string;
};
