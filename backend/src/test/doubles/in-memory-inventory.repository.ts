import { Inventory } from '../../inventory/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../inventory/domain/ports/inventory-repository.port';
import { ICreateInventory } from '../../inventory/domain/types/inventory-repository.types';

export class InMemoryInventoryRepository extends IInventoryRepositoryPort {
    private readonly inventories = new Map<string, Inventory>();

    async create(input: ICreateInventory): Promise<Inventory | null> {
        const { name, quantity, productId } = input;

        const existingInventory = await this.findByProductId(productId);
        if (existingInventory) return null;

        const existingInventoryByName = await this.findByName(name);
        if (existingInventoryByName) return null;

        const inventory = new Inventory(crypto.randomUUID(), name, quantity, productId, new Date(), new Date());
        this.inventories.set(inventory.id, inventory);

        return inventory;
    }

    async findByProductId(productId: string): Promise<Inventory | null> {
        return Array.from(this.inventories.values()).find((inv) => inv.productId === productId) ?? null;
    }

    async findByName(name: string): Promise<Inventory | null> {
        return Array.from(this.inventories.values()).find((inv) => inv.name === name) ?? null;
    }

    async updateProductAvailable(id: string, quantity: number): Promise<Inventory | null> {
        const inventory = this.inventories.get(id);
        if (!inventory) return null;

        const updated = new Inventory(
            inventory.id,
            inventory.name,
            quantity,
            inventory.productId,
            inventory.createdAt,
            inventory.updatedAt,
        );
        this.inventories.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<Inventory | null> {
        const inventory = this.inventories.get(id);

        if (!inventory) return null;

        this.inventories.delete(id);

        return inventory;
    }

    seed(inventory: Inventory): void {
        this.inventories.set(inventory.id, inventory);
    }

    getQuantity(id: string): number | undefined {
        return this.inventories.get(id)?.quantity;
    }
}
