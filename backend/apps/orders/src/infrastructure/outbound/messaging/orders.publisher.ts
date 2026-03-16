import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, InventoryReservedEvent, IOrderCreationRequestedEvent, IOrderConfirmedEvent } from '@app/shared';
import { IOrderEventsPublisherPort } from '../../../domain/ports/order-events-publisher.port';

@Injectable()
export class OrdersRabbitMqPublisher extends IOrderEventsPublisherPort {
    constructor(
        @Inject('INVENTORY_SERVICE') private readonly inventoryClient: ClientProxy,
        @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
        @Inject('PAYMENT_SERVICE') private readonly paymentClient: ClientProxy,
    ) {
        super();
    }

    async publishOrderCreationRequested(event: IOrderCreationRequestedEvent): Promise<void> {
        this.inventoryClient.emit(PATTERNS.ORDER_CREATION_REQUESTED, event);
    }

    async publishOrderConfirmed(event: IOrderConfirmedEvent): Promise<void> {
        this.notificationClient.emit(PATTERNS.ORDER_CONFIRMED, event);
    }

    async publishInventoryReservedToPayment(event: InventoryReservedEvent): Promise<void> {
        this.paymentClient.emit(PATTERNS.INVENTORY_RESERVED, event);
    }
}
