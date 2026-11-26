import { randomUUID } from 'crypto'
import { proto } from '../../WAProto/index.js'

export const DEFAULT_AI_BOT_JID = '259786046210223@bot'
export const AI_RICH_HTML_PRIMITIVE = 'GenAIaeacdsnwHtmlPrimitive'

export type SendHTMLOptions = {
	/** Fallback text shown in clients that cannot render HTML (defaults to title) */
	text?: string
	/** Title for the bubble / embedded screen (defaults to 'HTML') */
	title?: string
	/** true = "Klik Aku" bubble that opens the HTML screen; false = render inline (default false) */
	screen?: boolean
	/** Tab header name when screen=true (defaults to 'HTML') */
	tabHeader?: string
	/** Trusted sources array passed to the HTML primitive */
	trustedSources?: string[]
	/** Optional URL passed to the HTML primitive */
	url?: string
	/** Send with notification transparency metadata (default true) */
	notification?: boolean
	/** Bypass download via MESSAGE_EDIT follow-up (default true) */
	bypassDownload?: boolean
	/** Quoted message */
	quoted?: proto.IWebMessageInfo
	/** Custom message ID */
	messageId?: string
	/** Bot JID for forwardedAiBotMessageInfo */
	botJid?: string
}

export const buildHtmlRichMessageContent = (
	htmlInput: string | Buffer,
	options: SendHTMLOptions = {}
): proto.IMessage => {
	const html = Buffer.isBuffer(htmlInput) ? htmlInput.toString('utf8') : htmlInput
	if (typeof html !== 'string' || !html.trim()) {
		throw new TypeError('sendHTML: html must be a non-empty string or Buffer')
	}

	const {
		text,
		title = 'HTML',
		screen = false,
		tabHeader = 'HTML',
		trustedSources = [],
		url,
		notification = true,
		quoted,
		botJid = DEFAULT_AI_BOT_JID
	} = options

	const fallback = text ?? title

	const htmlSection = {
		__typename: 'GenAIUnifiedResponseSection',
		view_model: {
			__typename: 'GenAISingleLayoutViewModel',
			primitive: {
				__typename: AI_RICH_HTML_PRIMITIVE,
				payload: html,
				...(url ? { url } : {}),
				trusted_sources: trustedSources.map(String)
			}
		}
	}

	const sections = screen
		? [
				{
					__typename: 'GenAIUnifiedResponseSection',
					view_model: {
						__typename: 'GenAISingleLayoutViewModel',
						primitive: {
							__typename: 'GenAIBotProgressStatusPrimitive',
							title: `${title}: *Klik Aku*`,
							is_in_progress: true
						}
					}
				}
			]
		: [htmlSection]

	const embeddedScreens = screen
		? [
				{
					title,
					content: [
						{
							__typename: 'FOAIDNixelButtonSheets',
							tabs: [
								{
									id: 'tab_0',
									tab_header: tabHeader,
									sections: [htmlSection],
									step_entries: []
								}
							]
						}
					]
				}
			]
		: []

	const unifiedPayload = {
		response_id: randomUUID(),
		sections,
		...(embeddedScreens.length > 0 ? { embedded_screens: embeddedScreens } : {})
	}

	const contextInfo: proto.IContextInfo = {
		forwardingScore: 1,
		isForwarded: true,
		forwardedAiBotMessageInfo: { botJid },
		forwardOrigin: proto.ContextInfo.ForwardOrigin.META_AI
	}

	if (quoted?.key?.id) {
		contextInfo.stanzaId = quoted.key.id
		contextInfo.participant = quoted.key.participant || quoted.key.remoteJid || undefined
		contextInfo.quotedMessage = quoted.message || undefined
	}

	const richResponseMessage: proto.IAIRichResponseMessage = {
		messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
		submessages: [
			{
				messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
				messageText: fallback
			}
		],
		unifiedResponse: {
			data: Buffer.from(JSON.stringify(unifiedPayload), 'utf-8')
		},
		contextInfo
	}

	return proto.Message.create({
		messageContextInfo: {
			deviceListMetadata: {},
			deviceListMetadataVersion: 2,
			botMetadata: {
				...(title ? { messageDisclaimerText: title } : {}),
				botResponseId: randomUUID(),
				...(notification
					? {
							sessionTransparencyMetadata: {
								hcaId: `hca_${Date.now()}`,
								sessionTransparencyType: 1
							}
						}
					: {})
			}
		},
		botForwardedMessage: {
			message: {
				richResponseMessage
			}
		}
	})
}
