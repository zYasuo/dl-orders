import { Injectable } from '@nestjs/common';
import { CachePort, Paginated } from '@app/shared';
import { InventoryCacheKeyBuilder } from '../cache/inventory-cache-key-builder';
import { TFindAllInventoryQuery } from '../dto/find-all-inventory-query.schema';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import { InventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';

@Injectable()
export class FindAllInventoryUseCase {
  private readonly cacheTtlSeconds = 60 * 10;

  constructor(
    private readonly inventoryRepositoryPort: InventoryRepositoryPort,
    private readonly cache: CachePort,
    private readonly cacheKeyBuilder: InventoryCacheKeyBuilder,
  ) {}

  async execute(input: TFindAllInventoryQuery): Promise<Paginated<InventoryEntity>> {
    const { page, limit } = input;

    const cacheKey = await this.cacheKeyBuilder.buildListKey(page, limit);
    const cached = await this.cache.getJson<Paginated<InventoryEntity>>(cacheKey);

    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.inventoryRepositoryPort.findPage(page, limit),
      this.inventoryRepositoryPort.count(),
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
