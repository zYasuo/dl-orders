import { InventoryReservedEvent } from '@app/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class ConfirmOrderUseCase {
    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
    ) {}

    async execute(event: InventoryReservedEvent): Promise<void> {
        const order = await this.ordersRepositoryPort.updateStatus(event.orderId, OrderStatus.CONFIRMED);

        if (!order) {
            throw new NotFoundException(`Order ${event.orderId} not found`);
        }

        await this.orderAuditLogPort.log({
            orderId: order.id,
            action: 'ORDER_CONFIRMED',
            timestamp: new Date().toISOString(),
            details: {
                productId: order.productId,
                quantity: order.quantity,
                description: order.description,
                recipient: order.recipient,
            },
        });

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
