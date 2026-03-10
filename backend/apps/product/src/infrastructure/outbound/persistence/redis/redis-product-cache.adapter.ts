import { Injectable } from '@nestjs/common';
import { Product } from '../../../../domain/entities/product.entity';
import { IProductCachePort } from '../../../../domain/ports/product-cache.port';
import { REDIS_KEY_PREFIX } from '../../../redis/constants/redis.constants';
import { RedisService } from '../../../redis/redis.service';

function key(id: string): string {
    return `${REDIS_KEY_PREFIX}item:${id}`;
}

@Injectable()
export class RedisProductCacheAdapter extends IProductCachePort {
    constructor(private readonly redis: RedisService) {
        super();
    }

    async getById(id: string): Promise<Product | null> {
        const client = this.redis.getClient();
        const raw = await client.get(key(id));

        if (!raw) return null;

        const p = JSON.parse(raw) as Record<string, unknown>;
        return new Product(
            p.id as string,
            p.name as string,
            p.description as string,
            p.price as number,
            new Date(p.createdAt as string),
            new Date(p.updatedAt as string),
        );
    }

    async set(product: Product, ttlSeconds: number): Promise<void> {
        const client = this.redis.getClient();
        const payload = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        };
        
        await client.setex(key(product.id), ttlSeconds, JSON.stringify(payload));
    }

    async invalidate(id: string): Promise<void> {
        const client = this.redis.getClient();
        await client.del(key(id));
    }
}
