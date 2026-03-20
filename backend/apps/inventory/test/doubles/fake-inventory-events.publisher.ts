import {
  InventoryReservedEvent,
  InventoryReservationFailedEvent,
  IInventoryLowStockEvent,
} from '@app/shared';
import { InventoryEventsPublisherPort } from '../../src/domain/ports/inventory-events-publisher.port';

export class FakeInventoryEventsPublisher extends InventoryEventsPublisherPort {
  readonly reserved: InventoryReservedEvent[] = [];
  readonly failed: InventoryReservationFailedEvent[] = [];
  readonly lowStock: IInventoryLowStockEvent[] = [];

  async publishInventoryReserved(event: InventoryReservedEvent): Promise<void> {
    this.reserved.push(event);
  }

  async publishInventoryReservationFailed(event: InventoryReservationFailedEvent): Promise<void> {
    this.failed.push(event);
  }

  async publishInventoryLowStock(event: IInventoryLowStockEvent): Promise<void> {
    this.lowStock.push(event);
  }
}
