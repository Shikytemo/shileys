import type { Contact, WAMessage } from '../../Types'
import { lidToJid, normalizeContactLidToJid, normalizeMessageLidToJid } from '../../Utils/lid-utils'

const mapping: Record<string, string> = {
	'111@lid': '628111@s.whatsapp.net',
	'222@lid': '628222@s.whatsapp.net'
}

const getPNForLID = async (lid: string) => mapping[lid] || null

describe('LID utilities', () => {
	it('converts a known LID to a PN JID', async () => {
		await expect(lidToJid('111@lid', getPNForLID)).resolves.toBe('628111@s.whatsapp.net')
	})

	it('keeps an unknown LID unchanged', async () => {
		await expect(lidToJid('999@lid', getPNForLID)).resolves.toBe('999@lid')
	})

	it('normalizes message key LIDs without mutating by default', async () => {
		const message = {
			key: {
				remoteJid: '111@lid',
				participant: '222@lid',
				fromMe: false,
				id: 'A'
			}
		} as WAMessage

		const normalized = await normalizeMessageLidToJid(message, getPNForLID)

		expect(normalized.key.remoteJid).toBe('628111@s.whatsapp.net')
		expect(normalized.key.remoteJidAlt).toBe('111@lid')
		expect(normalized.key.participant).toBe('628222@s.whatsapp.net')
		expect(normalized.key.participantAlt).toBe('222@lid')
		expect(message.key.remoteJid).toBe('111@lid')
		expect(message.key.participant).toBe('222@lid')
	})

	it('normalizes contact IDs and keeps original LID', async () => {
		const contact = {
			id: '111@lid',
			name: 'Contact'
		} as Contact

		const normalized = await normalizeContactLidToJid(contact, getPNForLID)

		expect(normalized.id).toBe('628111@s.whatsapp.net')
		expect(normalized.lid).toBe('111@lid')
		expect(normalized.phoneNumber).toBe('628111@s.whatsapp.net')
		expect(contact.id).toBe('111@lid')
	})
})
