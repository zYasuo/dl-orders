import { Injectable } from '@nestjs/common';
import { TLookupInventoryByProductIds } from '../dto/lookup-inventory-by-product-ids.schema';
import { TInventoryStockLookupItem } from '../dto/inventory-stock-lookup-item';
import { InventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';

@Injectable()
export class LookupInventoryByProductIdsUseCase {
  constructor(private readonly inventoryRepositoryPort: InventoryRepositoryPort) {}

  async execute(input: TLookupInventoryByProductIds): Promise<TInventoryStockLookupItem[]> {
    const uniqueIds = [...new Set(input.productIds)];
    const rows = await this.inventoryRepositoryPort.findByProductIds(uniqueIds);
    return rows.map((e) => ({
      productId: e.productId,
      quantity: e.quantity,
      inStock: e.quantity > 0,
      lastUnits: e.quantity > 0 && e.isCriticalStock(),
    }));
  }
}
