import { proto } from '../../WAProto/index.js'
import type { NativeFlowButton } from '../Types'
import type { BinaryNode } from '../WABinary'
import { isJidGroup } from '../WABinary'

const PRIVACY_MODE_OFFSET = 77_980_457

const getPrivacyModeTs = () => (Math.floor(Date.now() / 1000) - PRIVACY_MODE_OFFSET).toString()

export const nativeFlowButton = (name: string, params: Record<string, unknown>): NativeFlowButton =>
	proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
		name,
		buttonParamsJson: JSON.stringify(params)
	})

export const quickReplyButton = (displayText: string, id: string) =>
	nativeFlowButton('quick_reply', {
		display_text: displayText,
		id
	})

export const urlButton = (displayText: string, url: string) =>
	nativeFlowButton('cta_url', {
		display_text: displayText,
		url,
		merchant_url: url
	})

export const copyButton = (displayText: string, copyCode: string) =>
	nativeFlowButton('cta_copy', {
		display_text: displayText,
		copy_code: copyCode
	})

export const callButton = (displayText: string, phoneNumber: string) =>
	nativeFlowButton('cta_call', {
		display_text: displayText,
		phone_number: phoneNumber
	})

export const singleSelectButton = (
	title: string,
	sections: {
		title?: string
		rows: {
			header?: string
			title: string
			description?: string
			id: string
		}[]
	}[]
) =>
	nativeFlowButton('single_select', {
		title,
		sections
	})

export const buildNativeFlowNode = (): BinaryNode => ({
	tag: 'biz',
	attrs: {
		actual_actors: '2',
		host_storage: '2',
		privacy_mode_ts: getPrivacyModeTs()
	},
	content: [
		{
			tag: 'interactive',
			attrs: {
				type: 'native_flow',
				v: '1'
			},
			content: [
				{
					tag: 'native_flow',
					attrs: {
						v: '9',
						name: 'mixed'
					}
				}
			]
		},
		{
			tag: 'quality_control',
			attrs: {
				source_type: 'third_party'
			}
		}
	]
})

export const buildNativeFlowAdditionalNodes = (jid: string): BinaryNode[] => {
	const nativeFlowNode = buildNativeFlowNode()

	if (isJidGroup(jid)) {
		return [nativeFlowNode]
	}

	return [
		{
			tag: 'bot',
			attrs: {
				biz_bot: '1'
			}
		},
		nativeFlowNode
	]
}
