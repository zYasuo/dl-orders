import { Inventory } from '../../src/domain/entities/inventory.entity';
import { IInventoryListCachePort } from '../../src/domain/ports/inventory-list-cache.port';

export class InMemoryInventoryListCache extends IInventoryListCachePort {
    private items: Inventory[] | null = null;

    async get(): Promise<Inventory[] | null> {
        return this.items;
    }

    async set(items: Inventory[], _ttlSeconds: number): Promise<void> {
        this.items = items;
    }

    async invalidate(): Promise<void> {
        this.items = null;
    }
}
