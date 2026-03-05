import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/entities/order.entity';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { InventoryReservedEvent } from '@app/shared';

@Injectable()
export class ConfirmOrderUseCase {
    private readonly logger = new Logger(ConfirmOrderUseCase.name);

    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
    ) {}

    async execute(event: InventoryReservedEvent): Promise<void> {
        const order = await this.ordersRepositoryPort.updateStatus(event.orderId, OrderStatus.CONFIRMED);

        if (!order) {
            throw new NotFoundException(`Order ${event.orderId} not found`);
        }

        this.logger.log(`Order ${order.id} confirmed`);

        await this.orderEventsPublisherPort.publishOrderConfirmed({
            orderId: order.id,
            productId: order.productId,
            quantity: order.quantity,
            description: order.description,
            recipient: order.recipient,
            confirmedAt: new Date().toISOString(),
        });
    }
}
