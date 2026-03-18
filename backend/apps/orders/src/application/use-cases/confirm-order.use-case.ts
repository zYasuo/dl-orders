import { Injectable, Logger } from '@nestjs/common';
import { IOrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrderSummaryPort } from '../../domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

export type TConfirmOrderEvent = { orderId: string };

@Injectable()
export class ConfirmOrderUseCase {
  private readonly logger = new Logger(ConfirmOrderUseCase.name);

  constructor(
    private readonly ordersRepositoryPort: IOrdersRepositoryPort,
    private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
    private readonly orderAuditLogPort: IOrderAuditLogPort,
    private readonly orderSummaryPort: IOrderSummaryPort,
  ) {}

  async execute(event: TConfirmOrderEvent): Promise<void> {
    const order = await this.ordersRepositoryPort.confirmIfPending(event.orderId);

    const now = new Date();
    const timestamp = now.toISOString();

    if (!order) {
      this.logger.warn(`Order ${event.orderId} already processed`);
      return;
    }

    const results = await Promise.allSettled([
      this.orderAuditLogPort.log({
        orderId: order.id,
        action: 'ORDER_CONFIRMED',
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
        idempotencyKey: order.idempotencyKey,
        createdAt: order.createdAt.toISOString(),
        updatedAt: timestamp,
      }),
      this.orderEventsPublisherPort.publishOrderConfirmed({
        orderId: order.id,
        productId: order.productId,
        productName: order.productName,
        productDescription: order.productDescription,
        totalPrice: order.totalPrice,
        userId: order.recipient,
        quantity: order.quantity,
        recipientEmail: order.recipient,
        confirmedAt: timestamp,
      }),
    ]);

    results.forEach((r) => {
      if (r.status === 'rejected') {
        const reason: unknown = r.reason;
        this.logger.warn('Order confirm side-effect failed', {
          orderId: order.id,
          error: reason,
        });
      }
    });
  }
}
