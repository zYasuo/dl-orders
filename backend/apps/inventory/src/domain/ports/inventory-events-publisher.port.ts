import { InventoryReservedEvent, InventoryReservationFailedEvent } from '@app/shared';

export abstract class InventoryEventsPublisherPort {
  abstract publishInventoryReserved(event: InventoryReservedEvent): Promise<void>;
  abstract publishInventoryReservationFailed(event: InventoryReservationFailedEvent): Promise<void>;
}
