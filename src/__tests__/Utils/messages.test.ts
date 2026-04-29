import { generateWAMessageContent } from '../../Utils/messages'

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
})
