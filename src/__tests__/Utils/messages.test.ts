import { generateWAMessageContent } from '../../Utils/messages'
import {
	buildNativeFlowAdditionalNodes,
	callButton,
	copyButton,
	quickReplyButton,
	singleSelectButton,
	urlButton
} from '../../Utils/native-flow'

describe('Message generation', () => {
	it('generates native flow interactive button messages', async () => {
		const content = await generateWAMessageContent(
			{
				text: 'Choose an option',
				title: 'Bot Menu',
				footer: 'Select one',
				interactiveButtons: [
					{
						name: 'quick_reply',
						buttonParamsJson: JSON.stringify({
							display_text: 'Open Menu',
							id: 'open_menu'
						})
					}
				]
			},
			{
				upload: async () => ({ mediaUrl: '', directPath: '' })
			} as any
		)

		const buttons = content.interactiveMessage?.nativeFlowMessage?.buttons
		expect(content.interactiveMessage?.body?.text).toBe('Choose an option')
		expect(content.interactiveMessage?.header?.title).toBe('Bot Menu')
		expect(content.interactiveMessage?.footer?.text).toBe('Select one')
		expect(content.interactiveMessage?.nativeFlowMessage?.buttons).toHaveLength(1)
		expect(buttons?.[0]).toMatchObject({
			name: 'quick_reply',
			buttonParamsJson: JSON.stringify({
				display_text: 'Open Menu',
				id: 'open_menu'
			})
		})
	})

	it('builds common native flow button helpers', () => {
		expect(quickReplyButton('Ping', '.ping')).toMatchObject({
			name: 'quick_reply',
			buttonParamsJson: JSON.stringify({
				display_text: 'Ping',
				id: '.ping'
			})
		})
		expect(urlButton('GitHub', 'https://github.com/Shikytemo/shileys')).toMatchObject({
			name: 'cta_url'
		})
		expect(copyButton('Copy', 'DIANABOT')).toMatchObject({
			name: 'cta_copy'
		})
		expect(callButton('Call', '628385863327')).toMatchObject({
			name: 'cta_call'
		})
		expect(
			singleSelectButton('Pilih', [
				{
					title: 'Menu',
					rows: [
						{
							title: 'Ping',
							id: '.ping'
						}
					]
				}
			])
		).toMatchObject({
			name: 'single_select'
		})
	})

	it('builds native flow relay nodes for user chats and groups', () => {
		expect(buildNativeFlowAdditionalNodes('628123@s.whatsapp.net').map(node => node.tag)).toEqual(['bot', 'biz'])
		expect(buildNativeFlowAdditionalNodes('120363@g.us').map(node => node.tag)).toEqual(['biz'])
	})
})
