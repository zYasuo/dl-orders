import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  PATTERNS,
  InventoryReservedEvent,
  IOrderCreationRequestedEvent,
  IOrderConfirmedEvent,
} from '@app/shared';
import { OrderEventsPublisherPort } from '../../../domain/ports/order-events-publisher.port';

@Injectable()
export class OrdersRabbitMqPublisher extends OrderEventsPublisherPort {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
  ) {
    super();
  }

  publishOrderCreationRequested(event: IOrderCreationRequestedEvent): Promise<void> {
    this.inventoryClient.emit(PATTERNS.ORDER_CREATION_REQUESTED, event);
    return Promise.resolve();
  }

  publishOrderConfirmed(event: IOrderConfirmedEvent): Promise<void> {
    this.notificationClient.emit(PATTERNS.ORDER_CONFIRMED, event);
    return Promise.resolve();
  }

  publishInventoryReservedToPayment(event: InventoryReservedEvent): Promise<void> {
    this.paymentClient.emit(PATTERNS.INVENTORY_RESERVED, event);
    return Promise.resolve();
  }
}
