import { Injectable, Logger } from '@nestjs/common';
import { OrderCreationRequestedEvent } from '@app/shared';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { IInventoryEventsPublisherPort } from '../../domain/ports/inventory-events-publisher.port';

@Injectable()
export class HandleOrderCreationRequestedUseCase {
    private readonly logger = new Logger(HandleOrderCreationRequestedUseCase.name);

    constructor(
        private readonly inventoryRepositoryPort: IInventoryRepositoryPort,
        private readonly inventoryEventsPublisherPort: IInventoryEventsPublisherPort,
    ) {}

    async execute(event: OrderCreationRequestedEvent): Promise<void> {
        const { orderId, productId, quantity } = event;

        const inventory = await this.inventoryRepositoryPort.findByProductId(productId);

        if (!inventory) {
            this.logger.warn(`No inventory for product ${productId}`);
            await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
                orderId,
                productId,
                quantity,
                reason: 'Inventory not available for this product',
            });
            return;
        }

        if (inventory.quantity < quantity) {
            this.logger.warn(`Insufficient stock for product ${productId}: have ${inventory.quantity}, need ${quantity}`);
            await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
                orderId,
                productId,
                quantity,
                reason: 'Insufficient inventory quantity',
            });
            return;
        }

        const updated = await this.inventoryRepositoryPort.updateProductAvailable(
            inventory.id,
            inventory.quantity - quantity,
        );

        if (!updated) {
            await this.inventoryEventsPublisherPort.publishInventoryReservationFailed({
                orderId,
                productId,
                quantity,
                reason: 'Failed to update inventory',
            });
            return;
        }

        this.logger.log(`Inventory reserved for order ${orderId}`);
        await this.inventoryEventsPublisherPort.publishInventoryReserved({
            orderId,
            productId,
            quantity,
        });
    }
}
