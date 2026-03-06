import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrderSummaryPort } from '../../domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { ICreateOrder } from '../../domain/types/order-repository.types';
import { TCreateOrder } from '../dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
    private readonly logger = new Logger(CreateOrderUseCase.name);

    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
        private readonly orderSummaryPort: IOrderSummaryPort,
    ) {}

    async execute(input: TCreateOrder) {
        const { productId, quantity, description, recipient } = input;

        const createInput: ICreateOrder = { productId, quantity, description, recipient };
        const order = await this.ordersRepositoryPort.create(createInput);

        if (!order) {
            throw new InternalServerErrorException('Failed to create order');
        }

        await this.orderAuditLogPort.log({
            orderId: order.id,
            action: 'ORDER_CREATED',
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

        await this.orderEventsPublisherPort.publishOrderCreationRequested({
            orderId: order.id,
            productId: order.productId,
            quantity: order.quantity,
            description: order.description,
            recipient: order.recipient,
        });

        return order;
    }
}
