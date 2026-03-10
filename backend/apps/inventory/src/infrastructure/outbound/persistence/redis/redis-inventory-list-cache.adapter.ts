import { Injectable } from '@nestjs/common';
import { Inventory } from '../../../../domain/entities/inventory.entity';
import { IInventoryListCachePort } from '../../../../domain/ports/inventory-list-cache.port';
import { REDIS_KEY_PREFIX } from '../../../redis/constants/redis.constants';
import { RedisService } from '../../../redis/redis.service';

const LIST_KEY = `${REDIS_KEY_PREFIX}list`;

@Injectable()
export class RedisInventoryListCacheAdapter extends IInventoryListCachePort {
    constructor(private readonly redis: RedisService) {
        super();
    }

    async get(): Promise<Inventory[] | null> {
        const client = this.redis.getClient();
        const raw = await client.get(LIST_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        return parsed.map(
            (p) =>
                new Inventory(
                    p.id as string,
                    p.name as string,
                    p.quantity as number,
                    p.productId as string,
                    new Date(p.createdAt as string),
                    new Date(p.updatedAt as string),
                ),
        );
    }

    async set(items: Inventory[], ttlSeconds: number): Promise<void> {
        const client = this.redis.getClient();
        const payload = items.map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            productId: i.productId,
            createdAt: i.createdAt.toISOString(),
            updatedAt: i.updatedAt.toISOString(),
        }));
        await client.setex(LIST_KEY, ttlSeconds, JSON.stringify(payload));
    }

    async invalidate(): Promise<void> {
        const client = this.redis.getClient();
        await client.del(LIST_KEY);
    }
}
