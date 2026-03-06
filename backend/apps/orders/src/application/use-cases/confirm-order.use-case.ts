import { InventoryReservedEvent } from '@app/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrderSummaryPort } from '../../domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class ConfirmOrderUseCase {
    private readonly logger = new Logger(ConfirmOrderUseCase.name);

    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
        private readonly orderSummaryPort: IOrderSummaryPort,
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

        try {
            await this.orderSummaryPort.put({
                orderId: order.id,
                status: order.status,
                productId: order.productId,
                quantity: order.quantity,
                description: order.description,
                recipient: order.recipient,
                createdAt: order.createdAt.toISOString(),
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            this.logger.warn('Failed to update order summary read model', {
                orderId: order.id,
                err,
            });
        }

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
