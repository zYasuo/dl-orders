import { Injectable } from '@nestjs/common';
import { CachePort, Paginated } from '@app/shared';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { OrdersCacheKeyBuilder } from '../cache/orders-cache-key-builder';
import { TFindAllOrdersQuery } from '../dto/find-all-orders-query.schema';

@Injectable()
export class FindAllOrdersUseCase {
  private readonly cacheTtlSeconds = 60 * 10;

  constructor(
    private readonly ordersRepositoryPort: OrdersRepositoryPort,
    private readonly cache: CachePort,
    private readonly cacheKeyBuilder: OrdersCacheKeyBuilder,
  ) {}

  async execute(input: TFindAllOrdersQuery): Promise<Paginated<OrderEntity>> {
    const { page, limit } = input;

    const cacheKey = await this.cacheKeyBuilder.buildListKey(page, limit);
    const cached = await this.cache.getJson<Paginated<OrderEntity>>(cacheKey);

    if (cached) {
      return cached;
    }

    const [data, total] = await Promise.all([
      this.ordersRepositoryPort.findPage(page, limit),
      this.ordersRepositoryPort.count(),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    const result = {
      data,
      meta: { page, limit, total, totalPages },
    };

    await this.cache.setJson(cacheKey, result, this.cacheTtlSeconds);

    return result;
  }
}
