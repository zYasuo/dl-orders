import { OrderWasCreatedEvent } from '../events/order-was-created.event';

export abstract class IOrderEventsPublisherPort {
  abstract publishOrderWasCreated(event: OrderWasCreatedEvent): Promise<void>;
}
