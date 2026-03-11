import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../../../../domain/entities/product.entity';
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

    async getById(id: string): Promise<ProductEntity | null> {
        const client = this.redis.getClient();
        const raw = await client.get(key(id));

        if (!raw) return null;

        const p = JSON.parse(raw) as Record<string, unknown>;
        return new ProductEntity(
            p.id as string,
            p.name as string,
            p.description as string,
            p.price as number,
            (p.imageUrl as string | null) ?? null,
            new Date(p.createdAt as string),
            new Date(p.updatedAt as string),
        );
    }

    async set(product: ProductEntity, ttlSeconds: number): Promise<void> {
        const client = this.redis.getClient();
        const payload = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        };
        await client.setex(key(product.id), ttlSeconds, JSON.stringify(payload));
    }

    async setAll(products: ProductEntity[], ttlSeconds: number): Promise<void> {
        const client = this.redis.getClient();
        const pipeline = client.pipeline();
        for (const product of products) {
            const payload = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            };
            pipeline.setex(key(product.id), ttlSeconds, JSON.stringify(payload));
        }
        await pipeline.exec();
    }

    async getAll(): Promise<ProductEntity[] | null> {
        const client = this.redis.getClient();
        const keys = await client.keys(`${REDIS_KEY_PREFIX}item:*`);

        if (!keys.length) return null;

        const products = await Promise.all(keys.map(async (key) => {
            const product = await this.getById(key.replace(`${REDIS_KEY_PREFIX}item:`, ''));
            return product;
        }));

        return products.filter((p): p is ProductEntity => p !== null);
    }

    async invalidate(id: string): Promise<void> {
        const client = this.redis.getClient();
        await client.del(key(id));
    }
}
