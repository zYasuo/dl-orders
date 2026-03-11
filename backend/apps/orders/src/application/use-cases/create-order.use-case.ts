import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../../domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrderSummaryPort } from '../../domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { IProductCatalogPort } from '../../domain/ports/product-catalog.port';
import { ICreateOrder } from '../../domain/types/order-repository.types';
import { TCreateOrder } from '../dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
    private readonly logger = new Logger(CreateOrderUseCase.name);

    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly productCatalogPort: IProductCatalogPort,
        private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
        private readonly orderSummaryPort: IOrderSummaryPort,
    ) {}

    async execute(input: TCreateOrder) {
        const { productId, quantity, description, recipient } = input;

        this.logger.log(`Creating order for product ${productId}`);

        const product = await this.productCatalogPort.findById(productId);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const totalPrice = OrderEntity.calculateTotalPrice(quantity, product.price);

        const createInput: ICreateOrder = {
            productId,
            quantity,
            description,
            recipient,
            productName: product.name,
            productDescription: product.description ?? '',
            unitPrice: product.price,
            totalPrice,
        };
        const order = await this.ordersRepositoryPort.create(createInput);

        const now = new Date();
        const timestamp = now.toISOString();

        const results = await Promise.allSettled([
            this.orderAuditLogPort.log({
                orderId: order.id,
                action: 'ORDER_CREATED',
                timestamp,
                details: {
                    productId: order.productId,
                    quantity: order.quantity,
                    description: order.description,
                    recipient: order.recipient,
                },
            }),
            this.orderSummaryPort.put({
                orderId: order.id,
                status: order.status,
                productId: order.productId,
                quantity: order.quantity,
                description: order.description,
                recipient: order.recipient,
                createdAt: order.createdAt.toISOString(),
                updatedAt: timestamp,
            }),
            this.orderEventsPublisherPort.publishOrderCreationRequested({
                orderId: order.id,
                productId: order.productId,
                productName: order.productName,
                productDescription: order.productDescription,
                totalPrice: order.totalPrice,
                userId: order.recipient,
                quantity: order.quantity,
                recipientEmail: order.recipient,
            }),
        ]);

        results.forEach((r) => {
            if (r.status === 'rejected') {
                this.logger.warn('Order creation side-effect failed', {
                    orderId: order.id,
                    error: r.reason,
                });
            }
        });

        return order;
    }
}
