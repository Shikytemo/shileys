import type { MediaType } from '../Defaults'
import type { WAMediaUploadFunction } from '../Types'
import { sleep } from './humanize'

export type UploadCacheStats = {
	hit: number
	miss: number
	deduped: number
	retried: number
	failed: number
}

export type CachedUploadFunction = WAMediaUploadFunction & {
	stats: UploadCacheStats
	clearCache: () => void
}

type UploadResult = Awaited<ReturnType<WAMediaUploadFunction>>

export const wrapUploadWithCache = (
	uploadFn: WAMediaUploadFunction,
	options: { maxEntries?: number; maxRetries?: number; retryDelayMs?: number } = {}
): CachedUploadFunction => {
	const maxEntries = options.maxEntries ?? 256
	const maxRetries = options.maxRetries ?? 2
	const retryDelayMs = options.retryDelayMs ?? 500

	const cache = new Map<string, UploadResult>()
	const inflight = new Map<string, Promise<UploadResult>>()
	const stats: UploadCacheStats = {
		hit: 0,
		miss: 0,
		deduped: 0,
		retried: 0,
		failed: 0
	}

	const setCache = (key: string, value: UploadResult) => {
		if (cache.size >= maxEntries) {
			const oldest = cache.keys().next().value
			if (oldest !== undefined) {
				cache.delete(oldest)
			}
		}

		cache.set(key, value)
	}

	const uploadWithRetry = async (
		encFilePath: string,
		opts: { fileEncSha256B64: string; mediaType: MediaType; timeoutMs?: number }
	): Promise<UploadResult> => {
		let lastError: unknown
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await uploadFn(encFilePath, opts)
			} catch (err) {
				lastError = err
				if (attempt < maxRetries) {
					stats.retried++
					await sleep(retryDelayMs * (attempt + 1))
				}
			}
		}

		stats.failed++
		throw lastError
	}

	const wrapped = (async (encFilePath, opts) => {
		const key = `${opts.mediaType}:${opts.fileEncSha256B64}`
		const cached = cache.get(key)
		if (cached) {
			stats.hit++
			return cached
		}

		const pending = inflight.get(key)
		if (pending) {
			stats.deduped++
			return pending
		}

		stats.miss++
		const promise = uploadWithRetry(encFilePath, opts)
			.then(result => {
				setCache(key, result)
				return result
			})
			.finally(() => {
				inflight.delete(key)
			})

		inflight.set(key, promise)
		return promise
	}) as CachedUploadFunction

	wrapped.stats = stats
	wrapped.clearCache = () => {
		cache.clear()
	}

	return wrapped
}
