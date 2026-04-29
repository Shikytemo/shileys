import type { Contact, WAMessage } from '../Types'
import { isLidUser } from '../WABinary'

export type GetPNForLID = (lid: string) => Promise<string | null | undefined>

export type NormalizeLidOptions = {
	/** mutate the input object instead of returning a cloned object */
	mutate?: boolean
}

const cloneJsonLike = <T>(value: T): T => {
	if (Array.isArray(value)) {
		return value.map(item => cloneJsonLike(item)) as T
	}

	if (value && typeof value === 'object') {
		if (
			value instanceof Date ||
			value instanceof Uint8Array ||
			value instanceof ArrayBuffer ||
			Buffer.isBuffer(value)
		) {
			return value
		}

		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneJsonLike(item)])) as T
	}

	return value
}

export const lidToJid = async (jid: string | null | undefined, getPNForLID: GetPNForLID) => {
	if (!jid || !isLidUser(jid)) {
		return jid
	}

	return (await getPNForLID(jid)) || jid
}

export const normalizeMessageLidToJid = async <T extends WAMessage>(
	message: T,
	getPNForLID: GetPNForLID,
	options: NormalizeLidOptions = {}
): Promise<T> => {
	const normalized = options.mutate ? message : cloneJsonLike(message)
	const key = normalized.key

	if (key.remoteJid && isLidUser(key.remoteJid)) {
		const pn = await getPNForLID(key.remoteJid!)
		if (pn) {
			key.remoteJidAlt ||= key.remoteJid
			key.remoteJid = pn
		}
	}

	if (key.participant && isLidUser(key.participant)) {
		const pn = await getPNForLID(key.participant!)
		if (pn) {
			key.participantAlt ||= key.participant
			key.participant = pn
		}
	}

	return normalized
}

export const normalizeContactLidToJid = async <T extends Contact>(
	contact: T,
	getPNForLID: GetPNForLID,
	options: NormalizeLidOptions = {}
): Promise<T> => {
	const normalized = options.mutate ? contact : cloneJsonLike(contact)

	if (isLidUser(normalized.id)) {
		const pn = await getPNForLID(normalized.id)
		if (pn) {
			normalized.lid ||= normalized.id
			normalized.phoneNumber ||= pn
			normalized.id = pn
		}
	}

	return normalized
}
