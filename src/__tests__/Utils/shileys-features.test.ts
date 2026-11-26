import EventEmitter from 'events'
import { makeLiteStore } from '../../Store/lite-store'
import { buildHtmlRichMessageContent, AI_RICH_HTML_PRIMITIVE } from '../../Utils/ai-rich'
import { makeCustomPresence } from '../../Utils/custom-presence'
import { createHumanizeController } from '../../Utils/humanize'
import { generateWAMessageContent } from '../../Utils/messages'
import { wrapUploadWithCache } from '../../Utils/upload-cache'

describe('Shileys extended mod features', () => {
	it('builds inline HTML AIRichResponseMessage like @kelvdra/baileys', () => {
		const msg = buildHtmlRichMessageContent('<h1>Hello</h1>', { text: 'Fallback' })
		const rich = msg.botForwardedMessage?.message?.richResponseMessage
		expect(rich).toBeDefined()
		expect(rich?.submessages?.[0]?.messageText).toBe('Fallback')
		const unified = JSON.parse(Buffer.from(rich!.unifiedResponse!.data!).toString('utf8'))
		expect(unified.sections[0].view_model.primitive.__typename).toBe(AI_RICH_HTML_PRIMITIVE)
		expect(unified.sections[0].view_model.primitive.payload).toBe('<h1>Hello</h1>')
		expect(unified.embedded_screens).toBeUndefined()
	})

	it('builds screen-mode HTML AIRichResponseMessage with embedded_screens', () => {
		const msg = buildHtmlRichMessageContent('<div>Game</div>', {
			screen: true,
			title: 'Mini App',
			tabHeader: 'Play'
		})
		const rich = msg.botForwardedMessage?.message?.richResponseMessage
		const unified = JSON.parse(Buffer.from(rich!.unifiedResponse!.data!).toString('utf8'))
		expect(unified.sections[0].view_model.primitive.__typename).toBe('GenAIBotProgressStatusPrimitive')
		expect(unified.sections[0].view_model.primitive.title).toBe('Mini App: *Klik Aku*')
		expect(unified.embedded_screens).toHaveLength(1)
		expect(unified.embedded_screens[0].content[0].tabs[0].tab_header).toBe('Play')
	})

	it('generates requestPayment and pollResult messages', async () => {
		const payment = await generateWAMessageContent(
			{
				requestPayment: {
					amount: 25000,
					currency: 'IDR',
					from: '628123@s.whatsapp.net',
					note: 'Invoice #1'
				}
			},
			{ upload: async () => ({ mediaUrl: '', directPath: '' }) } as any
		)
		expect(payment.requestPaymentMessage?.amount1000).toBe(25000000)
		expect(payment.requestPaymentMessage?.currencyCodeIso4217).toBe('IDR')

		const pollRes = await generateWAMessageContent(
			{
				pollResult: {
					name: 'Best mod?',
					options: [
						{ optionName: 'Shileys', optionVoteCount: 10 },
						{ optionName: 'Other', optionVoteCount: 2 }
					]
				}
			},
			{ upload: async () => ({ mediaUrl: '', directPath: '' }) } as any
		)
		expect(pollRes.pollResultSnapshotMessage?.name).toBe('Best mod?')
		expect(pollRes.pollResultSnapshotMessage?.pollVotes).toHaveLength(2)
	})

	it('converts legacy buttons and sections to nativeFlowMessage', async () => {
		const btnMsg = await generateWAMessageContent(
			{
				text: 'Pick one',
				buttons: [{ buttonId: 'b1', buttonText: { displayText: 'Option 1' } }]
			},
			{ upload: async () => ({ mediaUrl: '', directPath: '' }) } as any
		)
		expect(btnMsg.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name).toBe('quick_reply')

		const listMsg = await generateWAMessageContent(
			{
				text: 'Menu',
				buttonText: 'Open',
				sections: [
					{
						title: 'Main',
						rows: [{ title: 'Item 1', rowId: 'item_1' }]
					}
				]
			},
			{ upload: async () => ({ mediaUrl: '', directPath: '' }) } as any
		)
		expect(listMsg.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name).toBe('single_select')
	})

	it('caches and deduplicates media uploads', async () => {
		let calls = 0
		const cachedUpload = wrapUploadWithCache(async () => {
			calls++
			return { mediaUrl: 'https://mmg.whatsapp.net/ok', directPath: '/ok' }
		})

		const [a, b] = await Promise.all([
			cachedUpload('/tmp/a', { fileEncSha256B64: 'abc', mediaType: 'image' }),
			cachedUpload('/tmp/a', { fileEncSha256B64: 'abc', mediaType: 'image' })
		])
		const c = await cachedUpload('/tmp/a', { fileEncSha256B64: 'abc', mediaType: 'image' })

		expect(calls).toBe(1)
		expect(a.mediaUrl).toBe('https://mmg.whatsapp.net/ok')
		expect(b.mediaUrl).toBe('https://mmg.whatsapp.net/ok')
		expect(c.mediaUrl).toBe('https://mmg.whatsapp.net/ok')
		expect(cachedUpload.stats.deduped).toBe(1)
		expect(cachedUpload.stats.hit).toBe(1)
	})

	it('stores and loads messages/contacts/groups in liteStore', async () => {
		const ev = new EventEmitter() as any
		const store = makeLiteStore({ maxMessages: 10 })
		store.bind(ev)

		ev.emit('messages.upsert', {
			messages: [{ key: { remoteJid: '123@s.whatsapp.net', id: 'm1' }, message: { conversation: 'hi' } }]
		})
		ev.emit('contacts.upsert', [{ id: '123@s.whatsapp.net', name: 'Alice' }])

		const loaded = await store.loadMessage('123@s.whatsapp.net', 'm1')
		expect(loaded?.message?.conversation).toBe('hi')
		expect(store.getContact('123@s.whatsapp.net')?.name).toBe('Alice')
		expect(store.stats()).toEqual({ messages: 1, contacts: 1, groups: 0 })
	})

	it('computes bounded humanize delays and runs custom presence', async () => {
		const humanize = createHumanizeController({ enabled: true, minDelay: 100, maxDelay: 500, perCharMs: 10 })
		expect(humanize.enabled).toBe(true)
		expect(humanize.delayFor(5)).toBeGreaterThanOrEqual(100)
		expect(humanize.delayFor(500)).toBeLessThanOrEqual(500)

		const calls: string[] = []
		const { sendCustomPresence } = makeCustomPresence(async type => {
			calls.push(type)
		})
		await sendCustomPresence('123@s.whatsapp.net', { type: 'recording', duration: 10 })
		expect(calls).toEqual(['recording', 'paused'])
	})
})
