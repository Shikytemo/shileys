import type { BaileysEventEmitter, Contact, GroupMetadata, WAMessage } from '../Types'

export type LiteStoreConfig = {
	maxMessages?: number
	maxContacts?: number
	maxGroups?: number
	ttlMs?: number
}

type TimedEntry<T> = {
	value: T
	expiresAt: number
}

export const makeLiteStore = (config: LiteStoreConfig = {}) => {
	const maxMessages = config.maxMessages ?? 1000
	const maxContacts = config.maxContacts ?? 2000
	const maxGroups = config.maxGroups ?? 500
	const ttlMs = config.ttlMs ?? 60 * 60 * 1000

	const messages = new Map<string, TimedEntry<WAMessage>>()
	const contacts = new Map<string, TimedEntry<Contact>>()
	const groups = new Map<string, TimedEntry<GroupMetadata>>()

	const setBounded = <T>(map: Map<string, TimedEntry<T>>, key: string, value: T, max: number) => {
		if (map.has(key)) {
			map.delete(key)
		} else if (map.size >= max) {
			const oldest = map.keys().next().value
			if (oldest !== undefined) {
				map.delete(oldest)
			}
		}

		map.set(key, { value, expiresAt: Date.now() + ttlMs })
	}

	const getValid = <T>(map: Map<string, TimedEntry<T>>, key: string): T | undefined => {
		const entry = map.get(key)
		if (!entry) {
			return undefined
		}

		if (Date.now() > entry.expiresAt) {
			map.delete(key)
			return undefined
		}

		return entry.value
	}

	const msgKey = (jid: string, id: string) => `${jid}:${id}`

	const bind = (ev: BaileysEventEmitter) => {
		ev.on('messages.upsert', ({ messages: upserted }) => {
			for (const msg of upserted) {
				const jid = msg.key.remoteJid
				const id = msg.key.id
				if (jid && id) {
					setBounded(messages, msgKey(jid, id), msg, maxMessages)
				}
			}
		})

		ev.on('messages.update', updates => {
			for (const { key, update } of updates) {
				if (key.remoteJid && key.id) {
					const existing = getValid(messages, msgKey(key.remoteJid, key.id))
					if (existing) {
						setBounded(messages, msgKey(key.remoteJid, key.id), { ...existing, ...update }, maxMessages)
					}
				}
			}
		})

		ev.on('contacts.upsert', upserted => {
			for (const contact of upserted) {
				if (contact.id) {
					setBounded(contacts, contact.id, contact, maxContacts)
				}
			}
		})

		ev.on('contacts.update', updates => {
			for (const update of updates) {
				if (update.id) {
					const existing = getValid(contacts, update.id)
					setBounded(contacts, update.id, { ...existing, ...update } as Contact, maxContacts)
				}
			}
		})

		ev.on('groups.upsert', upserted => {
			for (const group of upserted) {
				if (group.id) {
					setBounded(groups, group.id, group, maxGroups)
				}
			}
		})

		ev.on('groups.update', updates => {
			for (const update of updates) {
				if (update.id) {
					const existing = getValid(groups, update.id)
					if (existing) {
						setBounded(groups, update.id, { ...existing, ...update }, maxGroups)
					}
				}
			}
		})
	}

	return {
		bind,
		loadMessage: async (jid: string, id: string) => getValid(messages, msgKey(jid, id)),
		getContact: (jid: string) => getValid(contacts, jid),
		getGroupMetadata: (jid: string) => getValid(groups, jid),
		clear: () => {
			messages.clear()
			contacts.clear()
			groups.clear()
		},
		stats: () => ({
			messages: messages.size,
			contacts: contacts.size,
			groups: groups.size
		})
	}
}
