import {
  InventoryReservedEvent,
  IOrderCreationRequestedEvent,
  IOrderConfirmedEvent,
} from '@app/shared';

export abstract class IOrderEventsPublisherPort {
  abstract publishOrderCreationRequested(event: IOrderCreationRequestedEvent): Promise<void>;
  abstract publishOrderConfirmed(event: IOrderConfirmedEvent): Promise<void>;
  abstract publishInventoryReservedToPayment(event: InventoryReservedEvent): Promise<void>;
}
