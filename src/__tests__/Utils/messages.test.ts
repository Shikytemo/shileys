import { generateWAMessageContent } from '../../Utils/messages'
import {
	addressButton,
	buildNativeFlowAdditionalNodes,
	callButton,
	catalogButton,
	copyButton,
	locationButton,
	quickReplyButton,
	reminderButton,
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
		expect(buildNativeFlowAdditionalNodes('628123@s.whatsapp.net').map(node => node.tag)).toEqual(['biz'])
		expect(buildNativeFlowAdditionalNodes('120363@g.us').map(node => node.tag)).toEqual(['biz'])
	})

	it('builds extended native flow button helpers', () => {
		expect(reminderButton('Remind me', 'rem_1')).toMatchObject({ name: 'cta_reminder' })
		expect(locationButton('Share location')).toMatchObject({ name: 'send_location' })
		expect(catalogButton('View catalog', '628123@s.whatsapp.net', 'prod_1')).toMatchObject({ name: 'cta_catalog' })
		expect(addressButton('Fill address', 'addr_1')).toMatchObject({ name: 'address_message' })
	})

	it('generates carousel card messages', async () => {
		const content = await generateWAMessageContent(
			{
				text: 'Featured items',
				footer: 'Swipe left',
				cards: [
					{
						title: 'Card 1',
						body: 'Item 1',
						buttons: [quickReplyButton('Buy 1', 'buy_1')]
					},
					{
						title: 'Card 2',
						body: 'Item 2',
						buttons: [urlButton('Open', 'https://example.com')]
					}
				]
			},
			{
				upload: async () => ({ mediaUrl: '', directPath: '' })
			} as any
		)

		expect(content.interactiveMessage?.body?.text).toBe('Featured items')
		expect(content.interactiveMessage?.footer?.text).toBe('Swipe left')
		expect(content.interactiveMessage?.carouselMessage?.cards).toHaveLength(2)
		expect(content.interactiveMessage?.carouselMessage?.cards?.[0]?.header?.title).toBe('Card 1')
		expect(content.interactiveMessage?.carouselMessage?.cards?.[1]?.nativeFlowMessage?.buttons?.[0]?.name).toBe(
			'cta_url'
		)
	})

	it('generates groupStatusV2 messages', async () => {
		const content = await generateWAMessageContent(
			{
				groupStatus: {
					text: 'Hello group status!'
				}
			},
			{
				upload: async () => ({ mediaUrl: '', directPath: '' })
			} as any
		)

		expect(content.groupStatusMessageV2?.message?.extendedTextMessage?.text).toBe('Hello group status!')
	})

	it('computes expected counts when album is passed as an array', async () => {
		const content = await generateWAMessageContent(
			{
				album: [
					{ image: { url: 'https://example.com/1.jpg' } },
					{ image: { url: 'https://example.com/2.jpg' } },
					{ video: { url: 'https://example.com/3.mp4' } }
				]
			},
			{
				upload: async () => ({ mediaUrl: '', directPath: '' })
			} as any
		)

		expect(content.albumMessage?.expectedImageCount).toBe(2)
		expect(content.albumMessage?.expectedVideoCount).toBe(1)
	})

	it('generates html document messages', async () => {
		const content = await generateWAMessageContent(
			{
				html: '<h1>Hello Shileys</h1>',
				fileName: 'hello.html',
				caption: 'HTML Preview'
			},
			{
				upload: async () => ({ mediaUrl: 'https://mmg.whatsapp.net/test', directPath: '/test' })
			} as any
		)

		expect(content.documentMessage?.mimetype).toBe('text/html')
		expect(content.documentMessage?.fileName).toBe('hello.html')
		expect(content.documentMessage?.caption).toBe('HTML Preview')
	})
})
