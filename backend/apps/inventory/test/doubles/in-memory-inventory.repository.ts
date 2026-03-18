import { InventoryEntity } from '../../src/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../src/domain/ports/inventory-repository.port';
import { ICreateInventory } from '../../src/domain/types/inventory-repository.types';

export class InMemoryInventoryRepository extends IInventoryRepositoryPort {
  private readonly inventories = new Map<string, InventoryEntity>();

  async create(input: ICreateInventory): Promise<InventoryEntity | null> {
    const { name, quantity, productId, maxQuantity, minQuantity, lowStockThreshold } = input;

    const existing = await this.findByProductId(productId);
    if (existing) return null;

    const existingByName = await this.findByName(name);
    if (existingByName) return null;

    const now = new Date();
    const inventory = InventoryEntity.create({
      id: crypto.randomUUID(),
      name,
      quantity,
      maxQuantity,
      minQuantity,
      lowStockThreshold,
      productId,
      createdAt: now,
      updatedAt: now,
    });
    this.inventories.set(inventory.id, inventory);

    return inventory;
  }

  async findByProductId(productId: string): Promise<InventoryEntity | null> {
    return Array.from(this.inventories.values()).find((inv) => inv.productId === productId) ?? null;
  }

  async findByName(name: string): Promise<InventoryEntity | null> {
    return Array.from(this.inventories.values()).find((inv) => inv.name === name) ?? null;
  }

  async decrementStock(id: string, quantity: number): Promise<InventoryEntity | null> {
    const inventory = this.inventories.get(id);
    if (!inventory || inventory.quantity < quantity) return null;

    const newQuantity = inventory.quantity - quantity;

    const updated = new InventoryEntity(
      inventory.id,
      inventory.name,
      newQuantity,
      inventory.maxQuantity,
      inventory.minQuantity,
      inventory.lowStockThreshold,
      inventory.productId,
      inventory.createdAt,
      new Date(),
    );
    this.inventories.set(id, updated);

    return updated;
  }
  async findAll(): Promise<InventoryEntity[]> {
    return Array.from(this.inventories.values());
  }

  async findLowStock(quantity: number): Promise<InventoryEntity[]> {
    return Array.from(this.inventories.values()).filter((inv) => inv.quantity <= quantity);
  }

  async delete(id: string): Promise<InventoryEntity | null> {
    const inventory = this.inventories.get(id);
    if (!inventory) return null;

    this.inventories.delete(id);

    return inventory;
  }

  seed(inventory: InventoryEntity): void {
    this.inventories.set(inventory.id, inventory);
  }

  getQuantity(id: string): number | undefined {
    return this.inventories.get(id)?.quantity;
  }
}
