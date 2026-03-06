import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class FindOrderByIdUseCase {
    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
    ) {}

    async execute(id: string): Promise<Order> {
        const order = await this.ordersRepositoryPort.findById(id);

        if (!order) throw new NotFoundException('Order not found');

        await this.orderAuditLogPort.log({
            orderId: order.id,
            action: 'ORDER_FOUND',
            timestamp: new Date().toISOString(),
            details: {
                productId: order.productId,
                quantity: order.quantity,
                description: order.description,
                recipient: order.recipient,
            },
        });

        return order;
    }
}
