import { OrderWasCreatedEvent } from '../events/order-was-created.event';

export abstract class OrderEventsPublisherPort {
    abstract publishOrderWasCreated(event: OrderWasCreatedEvent): Promise<void>;
}
