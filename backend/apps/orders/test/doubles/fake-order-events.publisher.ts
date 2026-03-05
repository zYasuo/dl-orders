import { OrderCreationRequestedEvent, OrderConfirmedEvent } from '@app/shared';
import { IOrderEventsPublisherPort } from '../../src/domain/ports/order-events-publisher.port';

export class FakeOrderEventsPublisher extends IOrderEventsPublisherPort {
    readonly creationRequested: OrderCreationRequestedEvent[] = [];
    readonly confirmed: OrderConfirmedEvent[] = [];

    async publishOrderCreationRequested(event: OrderCreationRequestedEvent): Promise<void> {
        this.creationRequested.push(event);
    }

    async publishOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
        this.confirmed.push(event);
    }
}
