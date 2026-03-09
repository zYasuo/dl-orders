import { OrderCreationRequestedEvent } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { IInventoryEventsPublisherPort } from '../../domain/ports/inventory-events-publisher.port';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { IReservationAuditLogPort } from '../../domain/ports/reservation-audit-log.port';

@Injectable()
export class HandleOrderCreationRequestedUseCase {
    constructor(
        private readonly inventoryRepositoryPort: IInventoryRepositoryPort,
        private readonly inventoryEventsPublisherPort: IInventoryEventsPublisherPort,
        private readonly reservationAuditLogPort: IReservationAuditLogPort,
    ) {}

    async execute(event: OrderCreationRequestedEvent): Promise<void> {
        const { orderId, productId, quantity } = event;

        await this.reservationAuditLogPort.log({
            orderId,
            action: 'RESERVATION_REQUESTED',
            timestamp: new Date().toISOString(),
            details: { productId, quantity },
        });

        const inventory = await this.inventoryRepositoryPort.findByProductId(productId);

        if (!inventory) {
            await this.reservationAuditLogPort.log({
                orderId,
                action: 'RESERVATION_FAILED',
                timestamp: new Date().toISOString(),
                details: { productId, quantity, reason: 'Inventory not available for this product' },
            });
            await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
                orderId,
                productId,
                quantity,
                reason: 'Inventory not available for this product',
            });
            return;
        }

        const updated = await this.inventoryRepositoryPort.decrementStock(inventory.id, quantity);

        if (!updated) {
            await this.reservationAuditLogPort.log({
                orderId,
                action: 'RESERVATION_FAILED',
                timestamp: new Date().toISOString(),
                details: { productId, quantity, reason: 'Insufficient inventory quantity' },
            });
            await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
                orderId,
                productId,
                quantity,
                reason: 'Insufficient inventory quantity',
            });
            return;
        }

        await this.reservationAuditLogPort.log({
            orderId,
            action: 'RESERVED',
            timestamp: new Date().toISOString(),
            details: { productId, quantity },
        });
        await this.inventoryEventsPublisherPort.publishInventoryReserved({
            orderId,
            productId,
            quantity,
        });
    }
}
