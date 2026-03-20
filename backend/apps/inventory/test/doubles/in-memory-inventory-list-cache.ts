import { InventoryEntity } from '../../src/domain/entities/inventory.entity';
import { InventoryListCachePort } from '../../src/domain/ports/inventory-list-cache.port';

export class InMemoryInventoryListCache extends InventoryListCachePort {
  private items: InventoryEntity[] | null = null;

  async get(): Promise<InventoryEntity[] | null> {
    return this.items;
  }

  async set(items: InventoryEntity[], _ttlSeconds: number): Promise<void> {
    this.items = items;
  }

  async invalidate(): Promise<void> {
    this.items = null;
  }
}
