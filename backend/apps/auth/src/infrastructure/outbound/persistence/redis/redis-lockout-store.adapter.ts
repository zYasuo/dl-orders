import { Injectable } from '@nestjs/common';
import { ILockoutStorePort } from '../../../../domain/ports/stores/lockout-store.port';
import { AuthLogsEntity } from '../../../../domain/entities/auth-logs.entity';
import { REDIS_KEY_PREFIX } from '../../../redis/constants/redis.constants';
import { RedisService } from '../../../redis/redis.service';

const LOCKOUT_ATTEMPTS_KEY = `${REDIS_KEY_PREFIX}lockout:attempts:`;
const LOCKOUT_UNTIL_KEY = `${REDIS_KEY_PREFIX}lockout:until:`;
const ATTEMPTS_WINDOW_SECONDS = 3600;

@Injectable()
export class RedisLockoutStoreAdapter extends ILockoutStorePort {
    constructor(private readonly redis: RedisService) {
        super();
    }

    async isLocked(userId: string): Promise<boolean> {
        const until = await this.getLockedUntil(userId);
        return until !== null && until > new Date();
    }

    async getLockedUntil(userId: string): Promise<Date | null> {
        const client = this.redis.getClient();
        const key = LOCKOUT_UNTIL_KEY + userId;
        const value = await client.get(key);
        if (!value) return null;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    async getFailedAttempts(userId: string): Promise<number> {
        const client = this.redis.getClient();
        const key = LOCKOUT_ATTEMPTS_KEY + userId;
        const value = await client.get(key);
        return value ? parseInt(value, 10) || 0 : 0;
    }

    async incrementFailedAttempts(userId: string): Promise<{ attempts: number; shouldLock: boolean }> {
        const client = this.redis.getClient();
        const key = LOCKOUT_ATTEMPTS_KEY + userId;
        const attempts = await client.incr(key);

        if (attempts === 1) {
            await client.expire(key, ATTEMPTS_WINDOW_SECONDS);
        }

        return {
            attempts,
            shouldLock: attempts >= AuthLogsEntity.MAX_LOGIN_ATTEMPTS,
        };
    }

    async setLocked(userId: string, minutes: number): Promise<void> {
        const client = this.redis.getClient();
        const untilKey = LOCKOUT_UNTIL_KEY + userId;
        const attemptsKey = LOCKOUT_ATTEMPTS_KEY + userId;

        const until = new Date(Date.now() + minutes * 60 * 1000);
        const ttlSeconds = minutes * 60;
        await client.setex(untilKey, ttlSeconds, until.toISOString());

        await client.del(attemptsKey);
    }

    async resetOnSuccess(userId: string): Promise<void> {
        const client = this.redis.getClient();
        await client.del(LOCKOUT_UNTIL_KEY + userId);
        await client.del(LOCKOUT_ATTEMPTS_KEY + userId);
    }
}
