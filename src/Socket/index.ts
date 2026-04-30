import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { AutoFollowNewsletterConfig, SocketConfig, UserFacingSocketConfig } from '../Types'
import { makeCommunitiesSocket } from './communities'

const newsletterUrlRegex = /(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i
const followedNewsletters = new Set<string>()

const getAutoFollowInput = (value: AutoFollowNewsletterConfig) => {
	if (value === true || value === false) {
		return ''
	}

	if (typeof value === 'string') {
		return value.trim()
	}

	return value.input.trim()
}

const shouldFollowOnce = (value: AutoFollowNewsletterConfig) => {
	if (typeof value === 'object') {
		return value.once !== false
	}

	return true
}

const extractNewsletterInvite = (input: string) => {
	const match = input.match(newsletterUrlRegex)
	if (match?.[1]) {
		return match[1]
	}

	return input.replace(/^@/, '').replace(/[^A-Za-z0-9_-]/g, '')
}

const resolveNewsletterJid = async (sock: ReturnType<typeof makeCommunitiesSocket>, input: string) => {
	if (input.endsWith('@newsletter')) {
		return input
	}

	const invite = extractNewsletterInvite(input)
	if (!invite) {
		throw new Error('autoFollowNewsletter input must be a newsletter JID or WhatsApp channel invite link')
	}

	const metadata = await sock.newsletterMetadata('invite', invite)
	if (!metadata?.id) {
		throw new Error('autoFollowNewsletter channel metadata not found')
	}

	return metadata.id.endsWith('@newsletter') ? metadata.id : `${metadata.id}@newsletter`
}

const attachAutoFollowNewsletter = (sock: ReturnType<typeof makeCommunitiesSocket>, config: SocketConfig) => {
	const input = getAutoFollowInput(config.autoFollowNewsletter)
	if (!input) {
		return
	}

	const once = shouldFollowOnce(config.autoFollowNewsletter)
	sock.ev.on('connection.update', update => {
		if (update.connection !== 'open') {
			return
		}

		resolveNewsletterJid(sock, input)
			.then(jid => {
				if (once && followedNewsletters.has(jid)) {
					return undefined
				}

				followedNewsletters.add(jid)
				return sock.newsletterFollow(jid)
			})
			.catch(error => config.logger.warn({ error }, 'autoFollowNewsletter failed'))
	})
}

// export the last socket layer
const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	const sock = makeCommunitiesSocket(newConfig)
	attachAutoFollowNewsletter(sock, newConfig)
	return sock
}

export default makeWASocket
