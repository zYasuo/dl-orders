import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { OrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { OrderSummaryPort } from '../../domain/ports/order-summary.port';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { ProductCatalogPort } from '../../domain/ports/product-catalog.port';
import { TCreateOrder } from '../dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    private readonly ordersRepositoryPort: OrdersRepositoryPort,
    private readonly productCatalogPort: ProductCatalogPort,
    private readonly orderEventsPublisherPort: OrderEventsPublisherPort,
    private readonly orderAuditLogPort: OrderAuditLogPort,
    private readonly orderSummaryPort: OrderSummaryPort,
  ) {}

  async execute(input: TCreateOrder) {
    const { productId, quantity, description, recipient, idempotencyKey } = input;

    this.logger.log(`Creating order for product ${productId}`);

    const product = await this.productCatalogPort.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalPrice = OrderEntity.calculateTotalPrice(quantity, product.price);

    const existingOrder = await this.ordersRepositoryPort.findByIdempotencyKey(idempotencyKey);

    if (existingOrder) {
      return existingOrder;
    }

    const orderEntity = OrderEntity.create({
      productId,
      quantity,
      description,
      recipient,
      productName: product.name,
      productDescription: product.description ?? '',
      unitPrice: product.price,
      totalPrice,
      idempotencyKey,
    });

    const order = await this.ordersRepositoryPort.create(orderEntity);

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
          idempotencyKey: order.idempotencyKey,
        },
      }),

      this.orderSummaryPort.put({
        orderId: order.id,
        status: order.status,
        productId: order.productId,
        quantity: order.quantity,
        description: order.description,
        idempotencyKey: order.idempotencyKey,
        recipient: order.recipient,
        createdAt: order.createdAt.toISOString(),
        updatedAt: timestamp,
      }),
      this.orderEventsPublisherPort.publishOrderCreationRequested({
        orderId: order.id,
        productId: order.productId,
        productName: order.productName,
        productDescription: order.productDescription,
        idempotencyKey: order.idempotencyKey,
        totalPrice: order.totalPrice,
        userId: order.recipient,
        quantity: order.quantity,
        recipientEmail: order.recipient,
      }),
    ]);

    results.forEach((r) => {
      if (r.status === 'rejected') {
        const reason: unknown = r.reason;
        this.logger.warn('Order creation side-effect failed', {
          orderId: order.id,
          error: reason,
        });
      }
    });

    return order;
  }
}
