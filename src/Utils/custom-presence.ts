import type { WAPresence } from '../Types'
import { sleep } from './humanize'

export type CustomPresenceState = Extract<WAPresence, 'composing' | 'recording' | 'paused'>

export type CustomPresenceStep = {
	type?: CustomPresenceState
	duration?: number
	text?: string
}

export type CustomPresenceOptions = CustomPresenceStep & {
	steps?: CustomPresenceStep[]
	wait?: boolean
	finish?: 'paused' | 'none'
}

export type CustomPresenceHandle = {
	stop: () => Promise<void>
	done: Promise<void>
}

const VALID_STATES = new Set<string>(['composing', 'recording', 'paused'])

const DEFAULTS = {
	duration: 2000,
	refreshEvery: 7000,
	perCharMs: 60,
	minTyping: 800,
	maxTyping: 10000,
	finish: 'paused' as const
}

function assertState(type: string): asserts type is CustomPresenceState {
	if (!VALID_STATES.has(type)) {
		throw new TypeError(`Invalid presence state: "${type}" (expected composing, recording, or paused)`)
	}
}

const resolveStepDuration = (step: CustomPresenceStep): number => {
	if (typeof step.duration === 'number' && step.duration >= 0) {
		return step.duration
	}

	if (typeof step.text === 'string' && step.text.length > 0) {
		return Math.min(DEFAULTS.maxTyping, Math.max(DEFAULTS.minTyping, step.text.length * DEFAULTS.perCharMs))
	}

	return DEFAULTS.duration
}

export const normalizePresenceSteps = (options: CustomPresenceOptions): { type: CustomPresenceState; duration: number }[] => {
	const source =
		Array.isArray(options.steps) && options.steps.length > 0
			? options.steps
			: [{ type: options.type ?? 'composing', duration: options.duration, text: options.text }]

	return source.map(step => {
		const type = step.type ?? 'composing'
		assertState(type)
		return { type, duration: resolveStepDuration(step) }
	})
}

export const makeCustomPresence = (
	baseSendPresence: (type: WAPresence, toJid?: string) => Promise<void>
) => {
	const sessions = new Map<string, AbortController>()

	const stopPresence = async (jid: string): Promise<void> => {
		const active = sessions.get(jid)
		if (active) {
			active.abort()
			sessions.delete(jid)
		}

		await baseSendPresence('paused', jid)
	}

	const holdStep = async (
		step: { type: CustomPresenceState; duration: number },
		jid: string,
		signal: AbortSignal
	): Promise<void> => {
		if (step.type === 'paused') {
			await baseSendPresence('paused', jid)
			await sleep(step.duration, signal)
			return
		}

		let remaining = step.duration
		do {
			if (signal.aborted) {
				return
			}

			await baseSendPresence(step.type, jid)
			const slice = Math.min(remaining, DEFAULTS.refreshEvery)
			await sleep(slice, signal)
			remaining -= slice
		} while (remaining > 0)
	}

	const sendCustomPresence = async (
		jid: string,
		options: CustomPresenceOptions
	): Promise<CustomPresenceHandle> => {
		const prev = sessions.get(jid)
		if (prev) {
			prev.abort()
		}

		const controller = new AbortController()
		sessions.set(jid, controller)
		const steps = normalizePresenceSteps(options)
		const finish = options.finish ?? DEFAULTS.finish

		const run = async () => {
			try {
				for (const step of steps) {
					if (controller.signal.aborted) {
						return
					}

					await holdStep(step, jid, controller.signal)
				}

				if (!controller.signal.aborted && finish === 'paused') {
					await baseSendPresence('paused', jid)
				}
			} finally {
				if (sessions.get(jid) === controller) {
					sessions.delete(jid)
				}
			}
		}

		const done = run()
		if (options.wait !== false) {
			await done
		}

		return {
			done,
			stop: () => stopPresence(jid)
		}
	}

	return {
		sendCustomPresence,
		stopPresence
	}
}
