import { Injectable, Logger } from '@nestjs/common';
import { OrderAuditLogPort } from '../../domain/ports/order-audit-log.port';
import { OrderSummaryPort } from '../../domain/ports/order-summary.port';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

export type TCancelOrderEvent = { orderId: string; reason: string };

@Injectable()
export class CancelOrderUseCase {
  private readonly logger = new Logger(CancelOrderUseCase.name);

  constructor(
    private readonly ordersRepositoryPort: OrdersRepositoryPort,
    private readonly orderAuditLogPort: OrderAuditLogPort,
    private readonly orderSummaryPort: OrderSummaryPort,
  ) {}

  async execute(event: TCancelOrderEvent): Promise<void> {
    const order = await this.ordersRepositoryPort.confirmIfPending(event.orderId);

    if (!order) {
      this.logger.warn(`Order ${event.orderId} already processed`);
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    const results = await Promise.allSettled([
      this.orderAuditLogPort.log({
        orderId: order.id,
        action: 'ORDER_CANCELLED',
        timestamp,
        details: { reason: event.reason },
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
    ]);

    results.forEach((r) => {
      if (r.status === 'rejected') {
        const reason: unknown = r.reason;
        this.logger.warn('Order cancel side-effect failed', {
          orderId: order.id,
          error: reason,
        });
      }
    });
  }
}
