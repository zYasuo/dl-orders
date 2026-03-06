import { InventoryReservationFailedEvent } from '@app/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class CancelOrderUseCase {
    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
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
    }
}
