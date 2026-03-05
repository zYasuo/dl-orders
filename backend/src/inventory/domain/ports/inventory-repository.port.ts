import { Inventory } from '../entities/inventory.entity';
import { ICreateInventory } from '../types/inventory-repository.types';

export abstract class IInventoryRepositoryPort {
    abstract create(input: ICreateInventory): Promise<Inventory | null>;
    abstract findByProductId(productId: string): Promise<Inventory | null>;
    abstract findByName(name: string): Promise<Inventory | null>;
    abstract updateProductAvailable(id: string, quantity: number): Promise<Inventory | null>;
    abstract delete(id: string): Promise<Inventory | null>;
}
