import {
  InventoryReservedEvent,
  IOrderCreationRequestedEvent,
  IOrderConfirmedEvent,
} from '@app/shared';
import { IOrderEventsPublisherPort } from '../../src/domain/ports/order-events-publisher.port';

export class FakeOrderEventsPublisher extends IOrderEventsPublisherPort {
  readonly creationRequested: IOrderCreationRequestedEvent[] = [];
  readonly confirmed: IOrderConfirmedEvent[] = [];
  readonly inventoryReservedToPayment: InventoryReservedEvent[] = [];

  async publishOrderCreationRequested(event: IOrderCreationRequestedEvent): Promise<void> {
    this.creationRequested.push(event);
  }

  async publishOrderConfirmed(event: IOrderConfirmedEvent): Promise<void> {
    this.confirmed.push(event);
  }

  async publishInventoryReservedToPayment(event: InventoryReservedEvent): Promise<void> {
    this.inventoryReservedToPayment.push(event);
  }
}
