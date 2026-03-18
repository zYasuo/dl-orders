import { Injectable } from '@nestjs/common';
import {
  IInventoryRepositoryPort,
} from '../../domain/ports/inventory-repository.port';
import { IInventoryLowStockPublisherPort } from '../../domain/ports/inventory-low-stock-publisher.port';
import { ILowStockNotificationDeduperPort } from '../../domain/ports/inventory-low-stock-notification-deduper.port';
import { TInventoryLowStockCursor } from '../../domain/types/inventory-repository.types';

const LOW_STOCK_BATCH_SIZE = 200;

@Injectable()
export class CheckQuantityInInventoryUseCase {
  constructor(
    private readonly inventoryRepository: IInventoryRepositoryPort,
    private readonly inventoryLowStockPublisher: IInventoryLowStockPublisherPort,
    private readonly lowStockNotificationDeduper: ILowStockNotificationDeduperPort,
  ) {}

  async execute(): Promise<void> {
    let cursor: TInventoryLowStockCursor | null = null;

    while (true) {
      const lowStockPage = await this.inventoryRepository.findLowStockPage(
        LOW_STOCK_BATCH_SIZE,
        cursor,
      );

      if (lowStockPage.length === 0) return;

      for (const inventory of lowStockPage) {
        const shouldNotify = await this.lowStockNotificationDeduper.shouldNotify(inventory.id);
        if (!shouldNotify) continue;

        await this.inventoryLowStockPublisher.publish({
          id: inventory.id,
          name: inventory.name,
          productId: inventory.productId,
          quantity: inventory.quantity,
          createdBy: inventory.createdBy,
        });
      }

      if (lowStockPage.length < LOW_STOCK_BATCH_SIZE) return;

      const last = lowStockPage[lowStockPage.length - 1];
      cursor = { updatedAt: last.updatedAt, id: last.id };
    }
  }
}
