export type HumanizeConfig = {
	enabled?: boolean
	minDelay?: number
	maxDelay?: number
	perCharMs?: number
}

export type HumanizeController = {
	enabled: boolean
	minDelay: number
	maxDelay: number
	perCharMs: number
	delayFor: (textLength?: number) => number
}

const DEFAULT_MIN_DELAY = 600
const DEFAULT_MAX_DELAY = 2500
const DEFAULT_PER_CHAR_MS = 25

export const createHumanizeController = (config?: boolean | HumanizeConfig): HumanizeController => {
	const opts = typeof config === 'object' && config !== null ? config : {}
	const controller: HumanizeController = {
		enabled: typeof config === 'boolean' ? config : (opts.enabled ?? false),
		minDelay: opts.minDelay ?? DEFAULT_MIN_DELAY,
		maxDelay: opts.maxDelay ?? DEFAULT_MAX_DELAY,
		perCharMs: opts.perCharMs ?? DEFAULT_PER_CHAR_MS,
		delayFor(textLength = 0) {
			const base = Math.max(this.minDelay, textLength * this.perCharMs)
			const capped = Math.min(this.maxDelay, base)
			const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(capped * 0.25)))
			return Math.min(this.maxDelay, capped + jitter)
		}
	}

	return controller
}

export const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
	new Promise(resolve => {
		if (ms <= 0 || signal?.aborted) {
			resolve()
			return
		}

		const onDone = () => {
			clearTimeout(timer)
			signal?.removeEventListener('abort', onDone)
			resolve()
		}

		const timer = setTimeout(onDone, ms)
		signal?.addEventListener('abort', onDone, { once: true })
	})
