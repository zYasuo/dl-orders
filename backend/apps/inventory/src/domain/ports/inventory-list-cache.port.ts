import { Inventory } from '../entities/inventory.entity';

export abstract class IInventoryListCachePort {
    abstract get(): Promise<Inventory[] | null>;
    abstract set(items: Inventory[], ttlSeconds: number): Promise<void>;
    abstract invalidate(): Promise<void>;
}
