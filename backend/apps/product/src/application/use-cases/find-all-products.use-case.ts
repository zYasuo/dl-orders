import { Injectable } from '@nestjs/common';
import { CachePort, Paginated } from '@app/shared';
import { ProductCacheKeyBuilder } from '../cache/product-cache-key-builder';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ProductEntity } from '../../domain/entities/product.entity';

@Injectable()
export class FindAllProductsUseCase {
  private readonly cacheTtlSeconds = 60 * 10;

  constructor(
    private readonly productRepositoryPort: ProductRepositoryPort,
    private readonly cache: CachePort,
    private readonly cacheKeyBuilder: ProductCacheKeyBuilder,
  ) {}

  async execute(page: number, limit: number): Promise<Paginated<ProductEntity>> {
    const cacheKey = await this.cacheKeyBuilder.buildListKey(page, limit);
    const cached = await this.cache.getJson<Paginated<ProductEntity>>(cacheKey);

    if (cached) {
      return cached;
    }

    const [data, total] = await Promise.all([
      this.productRepositoryPort.findPage(page, limit),
      this.productRepositoryPort.count(),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    const result = {
      data,
      meta: { page, limit, total, totalPages },
    };

    await this.cache.setJson(cacheKey, result, this.cacheTtlSeconds);

    return result;
  }
}
