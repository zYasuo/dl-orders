import { InventoryReservedEvent, InventoryReservationFailedEvent } from '@app/shared';
import { IInventoryEventsPublisherPort } from '../../src/domain/ports/inventory-events-publisher.port';

export class FakeInventoryEventsPublisher extends IInventoryEventsPublisherPort {
    readonly reserved: InventoryReservedEvent[] = [];
    readonly failed: InventoryReservationFailedEvent[] = [];

    async publishInventoryReserved(event: InventoryReservedEvent): Promise<void> {
        this.reserved.push(event);
    }

    async publishInventoryReservationFailed(event: InventoryReservationFailedEvent): Promise<void> {
        this.failed.push(event);
    }
}
