import { Injectable } from '@nestjs/common';
import { CachePort, Paginated, runWithCacheReadLock } from '@app/shared';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { OrdersCacheKeyBuilder } from '../cache/orders-cache-key-builder';
import { TFindAllOrdersQuery } from '../dto/find-all-orders-query.schema';
import type { TOrderAccessContext } from '../types/order-access.context';

@Injectable()
export class FindAllOrdersUseCase {
  private readonly cacheTtlSeconds = 60 * 10;

  constructor(
    private readonly ordersRepositoryPort: OrdersRepositoryPort,
    private readonly cache: CachePort,
    private readonly cacheKeyBuilder: OrdersCacheKeyBuilder,
  ) {}

  async execute(
    input: TFindAllOrdersQuery,
    access: TOrderAccessContext,
  ): Promise<Paginated<OrderEntity>> {
    const { page, limit } = input;

    const listScope =
      access.mode === 'internal-service'
        ? 'all'
        : { recipientEmail: access.email };
    const cacheKey = await this.cacheKeyBuilder.buildListKey(page, limit, listScope);
    const cached = await this.cache.getJson<Paginated<OrderEntity>>(cacheKey);

    if (cached) {
      return cached;
    }

    return runWithCacheReadLock<Paginated<OrderEntity>>(
      this.cache,
      cacheKey,
      () => this.readFromSourceAndCache(cacheKey, page, limit, access),
    );
  }

  private async readFromSourceAndCache(
    cacheKey: string,
    page: number,
    limit: number,
    access: TOrderAccessContext,
  ): Promise<Paginated<OrderEntity>> {
    const [data, total] =
      access.mode === 'internal-service'
        ? await Promise.all([
            this.ordersRepositoryPort.findPage(page, limit),
            this.ordersRepositoryPort.count(),
          ])
        : await Promise.all([
            this.ordersRepositoryPort.findPageByRecipient(access.email, page, limit),
            this.ordersRepositoryPort.countByRecipient(access.email),
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
