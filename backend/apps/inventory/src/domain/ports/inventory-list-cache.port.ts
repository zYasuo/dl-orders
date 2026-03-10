import { InventoryEntity } from '../entities/inventory.entity';

export abstract class IInventoryListCachePort {
    abstract get(): Promise<InventoryEntity[] | null>;
    abstract set(items: InventoryEntity[], ttlSeconds: number): Promise<void>;
    abstract invalidate(): Promise<void>;
}
