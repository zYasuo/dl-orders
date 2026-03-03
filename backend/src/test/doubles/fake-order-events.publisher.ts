import { IOrderEventsPublisherPort } from '../../orders/domain/ports/order-events-publisher.port';
import { OrderWasCreatedEvent } from '../../orders/domain/events/order-was-created.event';

export class FakeOrderEventsPublisher extends IOrderEventsPublisherPort {
    readonly published: OrderWasCreatedEvent[] = [];

    async publishOrderWasCreated(event: OrderWasCreatedEvent): Promise<void> {
        this.published.push(event);
    }
}
