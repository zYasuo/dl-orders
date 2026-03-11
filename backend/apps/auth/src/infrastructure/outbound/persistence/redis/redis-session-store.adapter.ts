import { Injectable } from '@nestjs/common';
import { ISessionStorePort, TSessionData } from '../../../../domain/ports/session-store.port';
import { REDIS_KEY_PREFIX } from '../../../redis/constants/redis.constants';
import { RedisService } from '../../../redis/redis.service';

const SESSION_KEY_PREFIX = `${REDIS_KEY_PREFIX}session:`;

@Injectable()
export class RedisSessionStoreAdapter extends ISessionStorePort {
    constructor(private readonly redis: RedisService) {
        super();
    }

    async set(
        sessionId: string,
        data: TSessionData,
        ttlSeconds: number,
    ): Promise<void> {
        const client = this.redis.getClient();
        const key = SESSION_KEY_PREFIX + sessionId;
        const value = JSON.stringify(data);
        await client.setex(key, ttlSeconds, value);
    }
}
