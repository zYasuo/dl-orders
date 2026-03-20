import { InventoryEntity } from '../entities/inventory.entity';
import {
  TInventoryLowStockCursor,
} from '../types/inventory-repository.types';

export abstract class InventoryRepositoryPort {
  abstract create(entity: InventoryEntity): Promise<InventoryEntity | null>;
  abstract findByProductId(productId: string): Promise<InventoryEntity | null>;
  abstract findByName(name: string): Promise<InventoryEntity | null>;
  abstract findAll(): Promise<InventoryEntity[]>;
  abstract findLowStock(): Promise<InventoryEntity[]>;
  abstract findLowStockPage(
    limit: number,
    cursor: TInventoryLowStockCursor | null,
  ): Promise<InventoryEntity[]>;
  abstract decrementStock(id: string, quantity: number): Promise<InventoryEntity | null>;
  abstract delete(id: string): Promise<InventoryEntity | null>;
}
