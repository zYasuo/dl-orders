import { randomUUID } from 'node:crypto';
import { CachePort } from '../ports/cache';

export type TCacheLockOptions = {
  lockTtlSeconds: number;
  waitAttempts: number;
  waitMs: number;
  lockAcquireRetries: number;
};

export const CACHE_LOCK_DEFAULTS: TCacheLockOptions = {
  lockTtlSeconds: 5,
  waitAttempts: 10,
  waitMs: 80,
  lockAcquireRetries: 3,
};

export async function runWithCacheReadLock<T>(
  cache: CachePort,
  cacheKey: string,
  onLockAcquired: () => Promise<T>,
  options: TCacheLockOptions = CACHE_LOCK_DEFAULTS,
): Promise<T> {
  const maxAttempts = Math.max(1, options.lockAcquireRetries + 1);

  for (let lockAttempt = 0; lockAttempt < maxAttempts; lockAttempt++) {
    const lockKey = `${cacheKey}:lock`;
    const lockValue = randomUUID();
    const acquired = await cache.setIfNotExists(lockKey, lockValue, options.lockTtlSeconds);

    if (acquired) {
      try {
        const fresh = await cache.getJson<T>(cacheKey);
        if (fresh) {
          return fresh;
        }
        return onLockAcquired();
      } finally {
        await cache.delIfEquals(lockKey, lockValue);
      }
    }

    for (let waitAttempt = 0; waitAttempt < options.waitAttempts; waitAttempt++) {
      await sleep(options.waitMs);
      const waited = await cache.getJson<T>(cacheKey);
      if (waited) {
        return waited;
      }
    }
  }

  throw new Error(`Failed to acquire cache lock for key ${cacheKey}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
