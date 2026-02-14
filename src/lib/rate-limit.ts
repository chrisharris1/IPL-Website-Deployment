
import { LRUCache } from 'lru-cache'

type RateLimitContext = {
    tokenCount: number
    lastRefilled: number
}

const tokenCache = new LRUCache<string, RateLimitContext>({
    max: 500,
    ttl: 60 * 1000, // 1 minute
})

export async function checkRateLimit(identifier: string, limit: number = 5): Promise<{ success: boolean; remaining: number }> {
    const token = tokenCache.get(identifier) || { tokenCount: 0, lastRefilled: Date.now() }

    const now = Date.now()

    if (token.tokenCount >= limit) {
        return { success: false, remaining: 0 }
    }

    token.tokenCount += 1
    token.lastRefilled = now
    tokenCache.set(identifier, token)

    return { success: true, remaining: limit - token.tokenCount }
}
