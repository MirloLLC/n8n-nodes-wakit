import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Wakit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'wakit',
		name: 'wakit',
		icon: 'file:wakit.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Send WhatsApp messages and manage contacts via wakit',
		defaults: {
			name: 'wakit',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'wakitApi',
				required: true,
			},
		],
		properties: [
			// ── Resource ──
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Message', value: 'message' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Template', value: 'template' },
					{ name: 'Quick Reply', value: 'quickReply' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'message',
			},

			// ── Message Operations ──
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{ name: 'Get Context', value: 'getContext', action: 'Get full conversation context' },
					{ name: 'Get Many', value: 'getMany', action: 'Get many messages' },
					{ name: 'Mark as Read', value: 'markRead', action: 'Mark a message as read' },
					{ name: 'Send Media', value: 'sendMedia', action: 'Send a media message' },
					{ name: 'Send Template', value: 'sendTemplate', action: 'Send a template message' },
					{ name: 'Send Text', value: 'sendText', action: 'Send a text message' },
				],
				default: 'sendText',
			},

			// ── Contact Operations ──
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a contact' },
					{ name: 'Get Many', value: 'getMany', action: 'Get many contacts' },
					{ name: 'Search', value: 'search', action: 'Search contacts' },
					{ name: 'Update', value: 'update', action: 'Update a contact' },
				],
				default: 'getMany',
			},

			// ── Conversation Operations ──
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['conversation'] } },
				options: [
					{ name: 'Get Many', value: 'getMany', action: 'Get many conversations' },
					{ name: 'Get', value: 'get', action: 'Get a conversation' },
					{ name: 'Update Status', value: 'updateStatus', action: 'Update conversation status' },
				],
				default: 'getMany',
			},

			// ── Template Operations ──
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['template'] } },
				options: [
					{ name: 'Get Many', value: 'getMany', action: 'Get many templates' },
					{ name: 'Create', value: 'create', action: 'Create a template' },
					{ name: 'Delete', value: 'delete', action: 'Delete a template' },
				],
				default: 'getMany',
			},

			// ── Quick Reply Operations ──
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['quickReply'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a quick reply' },
					{ name: 'Delete', value: 'delete', action: 'Delete a quick reply' },
					{ name: 'Get Many', value: 'getMany', action: 'Get many quick replies' },
					{ name: 'Update', value: 'update', action: 'Update a quick reply' },
				],
				default: 'getMany',
			},

			// ── Webhook Operations ──
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['webhook'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a webhook' },
					{ name: 'Delete', value: 'delete', action: 'Delete a webhook' },
					{ name: 'Get Many', value: 'getMany', action: 'Get many webhooks' },
				],
				default: 'getMany',
			},

			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			// MESSAGE FIELDS
			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				default: '',
				description: 'The organization ID',
				displayOptions: {
					show: {
						resource: ['message', 'contact', 'conversation', 'template', 'quickReply', 'webhook'],
					},
				},
			},
			// -- Get Context --
			{
				displayName: 'Conversation ID',
				name: 'contextConversationId',
				type: 'string',
				required: true,
				default: '',
				description: 'The conversation to fetch full message history from',
				displayOptions: {
					show: { resource: ['message'], operation: ['getContext'] },
				},
			},
			{
				displayName: 'Max Messages',
				name: 'contextLimit',
				type: 'number',
				default: 50,
				description: 'Maximum number of messages to include in context (most recent first)',
				typeOptions: { minValue: 1, maxValue: 500 },
				displayOptions: {
					show: { resource: ['message'], operation: ['getContext'] },
				},
			},
			{
				displayName: 'Include Contact Info',
				name: 'contextIncludeContact',
				type: 'boolean',
				default: true,
				description: 'Whether to include contact name and address in the output',
				displayOptions: {
					show: { resource: ['message'], operation: ['getContext'] },
				},
			},
			// -- Send Text --
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText', 'sendTemplate', 'sendMedia'] },
				},
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 4 },
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendText'] },
				},
			},
			// -- Send Template --
			{
				displayName: 'Organization Address (Phone Number ID)',
				name: 'organizationAddress',
				type: 'string',
				required: true,
				default: '',
				description: 'The WhatsApp phone number ID to send from',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
			},
			{
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
			},
			{
				displayName: 'Template Language',
				name: 'templateLanguage',
				type: 'string',
				required: true,
				default: 'es',
				description: 'Language code (e.g. es, en, pt_BR)',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
			},
			{
				displayName: 'Template Components (JSON)',
				name: 'templateComponents',
				type: 'json',
				default: '[]',
				description: 'Template variable components as JSON array',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
			},
			// -- Send Media --
			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				options: [
					{ name: 'Image', value: 'image' },
					{ name: 'Video', value: 'video' },
					{ name: 'Audio', value: 'audio' },
					{ name: 'Document', value: 'document' },
					{ name: 'Sticker', value: 'sticker' },
				],
				default: 'image',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
			},
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				required: true,
				default: '',
				description: 'Public URL of the media file',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
			},
			{
				displayName: 'MIME Type',
				name: 'mimeType',
				type: 'string',
				default: '',
				placeholder: 'image/jpeg',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendMedia'] },
				},
			},
			// -- Get Many Messages --
			{
				displayName: 'Conversation ID',
				name: 'conversationIdFilter',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['getMany'] },
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of results to return',
				typeOptions: { minValue: 1, maxValue: 1000 },
				displayOptions: {
					show: {
						resource: ['message', 'contact', 'conversation', 'quickReply', 'webhook'],
						operation: ['getMany'],
					},
				},
			},
			// -- Mark as Read --
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['message'], operation: ['markRead'] },
				},
			},

			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			// CONTACT FIELDS
			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['contact'], operation: ['create'] },
				},
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['contact'], operation: ['update'] },
				},
			},
			{
				displayName: 'Name',
				name: 'updateName',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['contact'], operation: ['update'] },
				},
			},
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				required: true,
				default: '',
				description: 'Search contacts by name',
				displayOptions: {
					show: { resource: ['contact'], operation: ['search'] },
				},
			},

			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			// CONVERSATION FIELDS
			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			{
				displayName: 'Conversation ID',
				name: 'conversationIdGet',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['conversation'], operation: ['get', 'updateStatus'] },
				},
			},
			{
				displayName: 'Status',
				name: 'conversationStatus',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Closed', value: 'closed' },
					{ name: 'Reopened', value: 'reopened' },
				],
				default: 'active',
				displayOptions: {
					show: { resource: ['conversation'], operation: ['updateStatus'] },
				},
			},

			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			// TEMPLATE FIELDS
			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			{
				displayName: 'Organization Address (Phone Number ID)',
				name: 'templateOrgAddress',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['template'] },
				},
			},
			{
				displayName: 'Template Name',
				name: 'newTemplateName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['template'], operation: ['create', 'delete'] },
				},
			},
			{
				displayName: 'Category',
				name: 'templateCategory',
				type: 'options',
				options: [
					{ name: 'Marketing', value: 'MARKETING' },
					{ name: 'Utility', value: 'UTILITY' },
					{ name: 'Authentication', value: 'AUTHENTICATION' },
				],
				default: 'UTILITY',
				displayOptions: {
					show: { resource: ['template'], operation: ['create'] },
				},
			},
			{
				displayName: 'Language',
				name: 'newTemplateLanguage',
				type: 'string',
				default: 'es',
				displayOptions: {
					show: { resource: ['template'], operation: ['create'] },
				},
			},
			{
				displayName: 'Components (JSON)',
				name: 'newTemplateComponents',
				type: 'json',
				default: '[{"type":"BODY","text":"Hello {{1}}"}]',
				displayOptions: {
					show: { resource: ['template'], operation: ['create'] },
				},
			},

			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			// QUICK REPLY FIELDS
			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			{
				displayName: 'Quick Reply ID',
				name: 'quickReplyId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['quickReply'], operation: ['update', 'delete'] },
				},
			},
			{
				displayName: 'Name',
				name: 'quickReplyName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['quickReply'], operation: ['create', 'update'] },
				},
			},
			{
				displayName: 'Content',
				name: 'quickReplyContent',
				type: 'string',
				typeOptions: { rows: 4 },
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['quickReply'], operation: ['create', 'update'] },
				},
			},

			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			// WEBHOOK FIELDS
			// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['webhook'], operation: ['delete'] },
				},
			},
			{
				displayName: 'URL',
				name: 'webhookUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com/webhook',
				displayOptions: {
					show: { resource: ['webhook'], operation: ['create'] },
				},
			},
			{
				displayName: 'Table',
				name: 'webhookTable',
				type: 'options',
				options: [
					{ name: 'Messages', value: 'messages' },
					{ name: 'Conversations', value: 'conversations' },
				],
				default: 'messages',
				displayOptions: {
					show: { resource: ['webhook'], operation: ['create'] },
				},
			},
			{
				displayName: 'Operations',
				name: 'webhookOperations',
				type: 'multiOptions',
				options: [
					{ name: 'Insert', value: 'insert' },
					{ name: 'Update', value: 'update' },
				],
				default: ['insert', 'update'],
				displayOptions: {
					show: { resource: ['webhook'], operation: ['create'] },
				},
			},
			{
				displayName: 'Token',
				name: 'webhookToken',
				type: 'string',
				default: '',
				description: 'Optional Bearer token sent with webhook requests',
				displayOptions: {
					show: { resource: ['webhook'], operation: ['create'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('wakitApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const orgId = this.getNodeParameter('organizationId', i) as string;

				let responseData: unknown;

				// ── MESSAGE ──
				if (resource === 'message') {
					if (operation === 'getContext') {
						const conversationId = this.getNodeParameter('contextConversationId', i) as string;
						const limit = this.getNodeParameter('contextLimit', i) as number;
						const includeContact = this.getNodeParameter('contextIncludeContact', i) as boolean;

						// 1. Fetch the conversation
						const conversations = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/conversations?id=eq.${conversationId}&select=*`,
						) as IDataObject[];
						const conversation = conversations?.[0] ?? {};

						// 2. Fetch all messages in chronological order
						const messages = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.asc&limit=${limit}`,
						) as IDataObject[];

						// 3. Optionally fetch contact info
						let contact: IDataObject = {};
						if (includeContact && conversation.contact_address) {
							const contacts = await wakitRequest.call(
								this, baseUrl, 'GET',
								`/rest/v1/contacts_addresses?organization_id=eq.${orgId}&address=eq.${conversation.contact_address}&select=*,contacts(*)`,
							) as IDataObject[];
							if (contacts?.[0]) {
								const ca = contacts[0] as IDataObject;
								const c = ca.contacts as IDataObject | undefined;
								contact = {
									address: ca.address,
									name: c?.name ?? null,
									id: c?.id ?? null,
								};
							}
						}

						responseData = {
							conversation_id: conversationId,
							contact,
							message_count: (messages || []).length,
							messages: (messages || []).map((m: IDataObject) => ({
								id: m.id,
								direction: m.direction,
								content: m.content,
								status: m.status,
								created_at: m.created_at,
								agent_id: m.agent_id,
							})),
						};
					} else if (operation === 'sendText') {
						const conversationId = this.getNodeParameter('conversationId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						responseData = await wakitRequest.call(this, baseUrl, 'POST', '/rest/v1/messages', {
							organization_id: orgId,
							conversation_id: conversationId,
							direction: 'outgoing',
							content: { kind: 'text', text },
						});
					} else if (operation === 'sendTemplate') {
						const conversationId = this.getNodeParameter('conversationId', i) as string;
						const orgAddress = this.getNodeParameter('organizationAddress', i) as string;
						const templateName = this.getNodeParameter('templateName', i) as string;
						const templateLanguage = this.getNodeParameter('templateLanguage', i) as string;
						const components = this.getNodeParameter('templateComponents', i) as string;
						responseData = await wakitRequest.call(this, baseUrl, 'POST', '/rest/v1/messages', {
							organization_id: orgId,
							organization_address: orgAddress,
							conversation_id: conversationId,
							direction: 'outgoing',
							content: {
								kind: 'template',
								template: {
									name: templateName,
									language: { code: templateLanguage },
									components: typeof components === 'string' ? JSON.parse(components) : components,
								},
							},
						});
					} else if (operation === 'sendMedia') {
						const conversationId = this.getNodeParameter('conversationId', i) as string;
						const mediaType = this.getNodeParameter('mediaType', i) as string;
						const mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
						const mimeType = this.getNodeParameter('mimeType', i, '') as string;
						const caption = this.getNodeParameter('caption', i, '') as string;
						responseData = await wakitRequest.call(this, baseUrl, 'POST', '/rest/v1/messages', {
							organization_id: orgId,
							conversation_id: conversationId,
							direction: 'outgoing',
							content: {
								kind: mediaType,
								file: { uri: mediaUrl, mime_type: mimeType || undefined },
								...(caption ? { text: caption } : {}),
							},
						});
					} else if (operation === 'getMany') {
						const conversationId = this.getNodeParameter('conversationIdFilter', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/messages?organization_id=eq.${orgId}&conversation_id=eq.${conversationId}&order=created_at.desc&limit=${limit}`,
						);
					} else if (operation === 'markRead') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'PATCH',
							`/rest/v1/messages?id=eq.${messageId}`,
							{ status: { read: new Date().toISOString() } },
						);
					}
				}

				// ── CONTACT ──
				else if (resource === 'contact') {
					if (operation === 'create') {
						const name = this.getNodeParameter('contactName', i) as string;
						responseData = await wakitRequest.call(this, baseUrl, 'POST', '/rest/v1/contacts', {
							organization_id: orgId,
							name,
						});
					} else if (operation === 'getMany') {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/contacts?organization_id=eq.${orgId}&order=updated_at.desc&limit=${limit}`,
						);
					} else if (operation === 'search') {
						const query = this.getNodeParameter('searchQuery', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/contacts?organization_id=eq.${orgId}&name=ilike.*${encodeURIComponent(query)}*`,
						);
					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const name = this.getNodeParameter('updateName', i) as string;
						const body: Record<string, unknown> = {};
						if (name) body.name = name;
						responseData = await wakitRequest.call(
							this, baseUrl, 'PATCH',
							`/rest/v1/contacts?id=eq.${contactId}`,
							body,
						);
					}
				}

				// ── CONVERSATION ──
				else if (resource === 'conversation') {
					if (operation === 'getMany') {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/conversations?organization_id=eq.${orgId}&order=updated_at.desc&limit=${limit}`,
						);
					} else if (operation === 'get') {
						const convId = this.getNodeParameter('conversationIdGet', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/conversations?id=eq.${convId}`,
						);
					} else if (operation === 'updateStatus') {
						const convId = this.getNodeParameter('conversationIdGet', i) as string;
						const status = this.getNodeParameter('conversationStatus', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'PATCH',
							`/rest/v1/conversations?id=eq.${convId}`,
							{ status },
						);
					}
				}

				// ── TEMPLATE ──
				else if (resource === 'template') {
					const orgAddress = this.getNodeParameter('templateOrgAddress', i) as string;
					if (operation === 'getMany') {
						responseData = await wakitRequest.call(
							this, baseUrl, 'PUT',
							'/functions/v1/whatsapp-management/templates',
							{ organization_id: orgId, organization_address: orgAddress },
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('newTemplateName', i) as string;
						const category = this.getNodeParameter('templateCategory', i) as string;
						const language = this.getNodeParameter('newTemplateLanguage', i) as string;
						const components = this.getNodeParameter('newTemplateComponents', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'POST',
							'/functions/v1/whatsapp-management/templates',
							{
								organization_id: orgId,
								organization_address: orgAddress,
								template: {
									name,
									category,
									language,
									components: typeof components === 'string' ? JSON.parse(components) : components,
								},
							},
						);
					} else if (operation === 'delete') {
						const name = this.getNodeParameter('newTemplateName', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'DELETE',
							'/functions/v1/whatsapp-management/templates',
							{
								organization_id: orgId,
								organization_address: orgAddress,
								template: { name },
							},
						);
					}
				}

				// ── QUICK REPLY ──
				else if (resource === 'quickReply') {
					if (operation === 'getMany') {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/quick_replies?organization_id=eq.${orgId}&order=name&limit=${limit}`,
						);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('quickReplyName', i) as string;
						const content = this.getNodeParameter('quickReplyContent', i) as string;
						responseData = await wakitRequest.call(this, baseUrl, 'POST', '/rest/v1/quick_replies', {
							organization_id: orgId,
							name,
							content,
						});
					} else if (operation === 'update') {
						const id = this.getNodeParameter('quickReplyId', i) as string;
						const name = this.getNodeParameter('quickReplyName', i) as string;
						const content = this.getNodeParameter('quickReplyContent', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'PATCH',
							`/rest/v1/quick_replies?id=eq.${id}`,
							{ name, content },
						);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('quickReplyId', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'DELETE',
							`/rest/v1/quick_replies?id=eq.${id}`,
						);
					}
				}

				// ── WEBHOOK ──
				else if (resource === 'webhook') {
					if (operation === 'getMany') {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await wakitRequest.call(
							this, baseUrl, 'GET',
							`/rest/v1/webhooks?organization_id=eq.${orgId}&limit=${limit}`,
						);
					} else if (operation === 'create') {
						const url = this.getNodeParameter('webhookUrl', i) as string;
						const table = this.getNodeParameter('webhookTable', i) as string;
						const ops = this.getNodeParameter('webhookOperations', i) as string[];
						const token = this.getNodeParameter('webhookToken', i, '') as string;
						responseData = await wakitRequest.call(this, baseUrl, 'POST', '/rest/v1/webhooks', {
							organization_id: orgId,
							url,
							table_name: table,
							operations: ops,
							...(token ? { token } : {}),
						});
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('webhookId', i) as string;
						responseData = await wakitRequest.call(
							this, baseUrl, 'DELETE',
							`/rest/v1/webhooks?id=eq.${id}`,
						);
					}
				}

				const items = Array.isArray(responseData) ? responseData : [responseData ?? { success: true }];
				for (const item of items) {
					returnData.push({ json: item as IDataObject });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

async function wakitRequest(
	this: IExecuteFunctions,
	baseUrl: string,
	method: IHttpRequestMethods,
	path: string,
	body?: Record<string, unknown>,
): Promise<unknown> {
	const options: IRequestOptions = {
		method,
		uri: `${baseUrl.replace(/\/$/, '')}${path}`,
		headers: {
			'Content-Type': 'application/json',
			Prefer: method === 'POST' ? 'return=representation' : undefined,
		},
		json: true,
	};

	if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE')) {
		options.body = body;
	}

	return this.helpers.requestWithAuthentication.call(this, 'wakitApi', options);
}
