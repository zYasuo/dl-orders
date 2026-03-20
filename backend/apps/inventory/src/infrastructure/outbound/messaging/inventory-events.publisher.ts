import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PATTERNS,
  InventoryReservedEvent,
  InventoryReservationFailedEvent,
  IInventoryLowStockEvent,
} from '@app/shared';
import { InventoryEventsPublisherPort } from '../../../domain/ports/inventory-events-publisher.port';

@Injectable()
export class InventoryRabbitMqPublisher extends InventoryEventsPublisherPort {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {
    super();
  }

  publishInventoryReserved(event: InventoryReservedEvent): Promise<void> {
    this.ordersClient.emit(PATTERNS.INVENTORY_RESERVED, event);
    return Promise.resolve();
  }

  publishInventoryReservationFailed(event: InventoryReservationFailedEvent): Promise<void> {
    this.ordersClient.emit(PATTERNS.INVENTORY_RESERVATION_FAILED, event);
    return Promise.resolve();
  }

  publish(event: IInventoryLowStockEvent): Promise<void> {
    this.notificationClient.emit(PATTERNS.INVENTORY_LOW_STOCK, event);
    return Promise.resolve();
  }

  publishInventoryLowStock(event: IInventoryLowStockEvent): Promise<void> {
    return this.publish(event);
  }
}
