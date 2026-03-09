import { InventoryReservedEvent, OrderCreationRequestedEvent, OrderConfirmedEvent } from '@app/shared';

export abstract class IOrderEventsPublisherPort {
    abstract publishOrderCreationRequested(event: OrderCreationRequestedEvent): Promise<void>;
    abstract publishOrderConfirmed(event: OrderConfirmedEvent): Promise<void>;
    abstract publishInventoryReservedToPayment(event: InventoryReservedEvent): Promise<void>;
}
