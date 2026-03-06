import { InventoryReservationFailedEvent } from '@app/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrderSummaryPort } from '../../domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class CancelOrderUseCase {
    private readonly logger = new Logger(CancelOrderUseCase.name);

    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
        private readonly orderSummaryPort: IOrderSummaryPort,
    ) {}

    async execute(event: InventoryReservationFailedEvent): Promise<void> {
        const order = await this.ordersRepositoryPort.updateStatus(event.orderId, OrderStatus.CANCELLED);

        if (!order) {
            throw new NotFoundException(`Order ${event.orderId} not found`);
        }

        await this.orderAuditLogPort.log({
            orderId: order.id,
            action: 'ORDER_CANCELLED',
            timestamp: new Date().toISOString(),
            details: { reason: event.reason },
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
    }
}
