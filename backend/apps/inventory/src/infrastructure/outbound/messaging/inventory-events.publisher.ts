import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, InventoryReservedEvent, InventoryReservationFailedEvent } from '@app/shared';
import { IInventoryEventsPublisherPort } from '../../../domain/ports/inventory-events-publisher.port';

@Injectable()
export class InventoryRabbitMqPublisher extends IInventoryEventsPublisherPort {
    constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {
        super();
    }

    async publishInventoryReserved(event: InventoryReservedEvent): Promise<void> {
        this.ordersClient.emit(PATTERNS.INVENTORY_RESERVED, event);
    }

    async publishInventoryReservationFailed(event: InventoryReservationFailedEvent): Promise<void> {
        this.ordersClient.emit(PATTERNS.INVENTORY_RESERVATION_FAILED, event);
    }
}
