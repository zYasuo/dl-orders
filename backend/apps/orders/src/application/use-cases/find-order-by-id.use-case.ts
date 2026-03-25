import { Injectable, NotFoundException } from '@nestjs/common';
import { CachePort } from '@app/shared';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { orderCacheKey } from '../cache/order-cache-key';

@Injectable()
export class FindOrderByIdUseCase {
  private readonly cacheTtlSeconds = 60 * 5;

  constructor(
    private readonly ordersRepositoryPort: OrdersRepositoryPort,
    private readonly cache: CachePort,
  ) {}

  async execute(id: string): Promise<OrderEntity> {
    const cached = await this.cache.getJson<OrderEntity>(orderCacheKey(id));
    if (cached) {
      return cached;
    }

    const order = await this.ordersRepositoryPort.findById(id);

    if (!order) throw new NotFoundException('Order not found');

    await this.cache.setJson(orderCacheKey(id), order, this.cacheTtlSeconds);

    return order;
  }
}
