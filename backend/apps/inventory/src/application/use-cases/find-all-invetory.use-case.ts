import { Injectable } from '@nestjs/common';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import { InventoryListCachePort } from '../../domain/ports/inventory-list-cache.port';
import { InventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';

const LIST_CACHE_TTL_SECONDS = 60;

@Injectable()
export class FindAllInventoryUseCase {
  constructor(
    private readonly inventoryRepositoryPort: InventoryRepositoryPort,
    private readonly listCache: InventoryListCachePort,
  ) {}

  async execute(): Promise<InventoryEntity[]> {
    const cached = await this.listCache.get();
    if (cached !== null) return cached;

    const items = await this.inventoryRepositoryPort.findAll();
    await this.listCache.set(items, LIST_CACHE_TTL_SECONDS);

    return items;
  }
}
