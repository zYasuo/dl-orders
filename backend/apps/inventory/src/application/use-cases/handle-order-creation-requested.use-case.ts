import { CachePort, IOrderCreationRequestedEvent } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InventoryEventsPublisherPort } from '../../domain/ports/inventory-events-publisher.port';
import { InventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { ReservationAuditLogPort } from '../../domain/ports/reservation-audit-log.port';

@Injectable()
export class HandleOrderCreationRequestedUseCase {
  private readonly listVersionKey = 'inventories:all:version';

  constructor(
    private readonly inventoryRepositoryPort: InventoryRepositoryPort,
    private readonly inventoryEventsPublisherPort: InventoryEventsPublisherPort,
    private readonly reservationAuditLogPort: ReservationAuditLogPort,
    private readonly cache: CachePort,
  ) {}

  async execute(event: IOrderCreationRequestedEvent): Promise<void> {
    const { orderId, productId, quantity } = event;

    await this.reservationAuditLogPort.log({
      orderId,
      action: 'RESERVATION_REQUESTED',
      timestamp: new Date().toISOString(),
      details: { productId, quantity },
    });

    const inventory = await this.inventoryRepositoryPort.findByProductId(productId);

    if (!inventory) {
      await this.reservationAuditLogPort.log({
        orderId,
        action: 'RESERVATION_FAILED',
        timestamp: new Date().toISOString(),
        details: { productId, quantity, reason: 'Inventory not available for this product' },
      });
      await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
        orderId,
        productId,
        quantity,
        reason: 'Inventory not available for this product',
      });
      return;
    }

    const updated = await this.inventoryRepositoryPort.decrementStock(inventory.id, quantity);

    if (!updated) {
      await this.reservationAuditLogPort.log({
        orderId,
        action: 'RESERVATION_FAILED',
        timestamp: new Date().toISOString(),
        details: { productId, quantity, reason: 'Insufficient inventory quantity' },
      });
      await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
        orderId,
        productId,
        quantity,
        reason: 'Insufficient inventory quantity',
      });
      return;
    }

    await this.reservationAuditLogPort.log({
      orderId,
      action: 'RESERVED',
      timestamp: new Date().toISOString(),
      details: { productId, quantity },
    });
    await this.inventoryEventsPublisherPort.publishInventoryReserved({
      orderId,
      productId,
      quantity,
    });
    await this.cache.incr(this.listVersionKey);
  }
}
