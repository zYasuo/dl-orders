import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CachePort } from '@app/shared';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { orderCacheKey } from '../cache/order-cache-key';
import { normalizeOrderRecipientEmail, type TOrderAccessContext } from '../types/order-access.context';

@Injectable()
export class FindOrderByIdUseCase {
  private readonly cacheTtlSeconds = 60 * 5;

  constructor(
    private readonly ordersRepositoryPort: OrdersRepositoryPort,
    private readonly cache: CachePort,
  ) {}

  async execute(id: string, access: TOrderAccessContext): Promise<OrderEntity> {
    const cached = await this.cache.getJson<OrderEntity>(orderCacheKey(id));
    if (cached) {
      this.assertRecipientAccess(cached, access);
      return cached;
    }

    const order = await this.ordersRepositoryPort.findById(id);

    if (!order) throw new NotFoundException('Order not found');

    this.assertRecipientAccess(order, access);

    await this.cache.setJson(orderCacheKey(id), order, this.cacheTtlSeconds);

    return order;
  }

  private assertRecipientAccess(order: OrderEntity, access: TOrderAccessContext): void {
    if (access.mode === 'internal-service') {
      return;
    }
    const owner = normalizeOrderRecipientEmail(order.recipient);
    if (owner !== access.email) {
      throw new ForbiddenException('Forbidden');
    }
  }
}
