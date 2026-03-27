import { Test, TestingModule } from '@nestjs/testing';
import { CachePort, Paginated } from '@app/shared';
import { OrdersCacheKeyBuilder } from '../../../src/application/cache/orders-cache-key-builder';
import { FindAllOrdersUseCase } from '../../../src/application/use-cases/find-all-orders.use-case';
import { OrderEntity, OrderStatus } from '../../../src/domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

jest.mock('@app/shared', () => {
  const actual = jest.requireActual('@app/shared');
  return {
    ...actual,
    runWithCacheReadLock: jest.fn(
      (_cache: unknown, _key: string, fn: () => Promise<Paginated<OrderEntity>>) => fn(),
    ),
  };
});

describe('FindAllOrdersUseCase', () => {
  let sut: FindAllOrdersUseCase;
  let ordersRepository: jest.Mocked<OrdersRepositoryPort>;
  let cache: jest.Mocked<CachePort>;
  let cacheKeyBuilder: jest.Mocked<OrdersCacheKeyBuilder>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const idempotencyKey = crypto.randomUUID();

  const makeOrder = (recipient: string) =>
    new OrderEntity({
      id: crypto.randomUUID(),
      description: 'd',
      status: OrderStatus.PENDING,
      productId: 'p1',
      quantity: 1,
      createdAt,
      updatedAt: createdAt,
      recipient,
      productName: 'P',
      productDescription: '',
      idempotencyKey,
      unitPrice: 1,
      totalPrice: 1,
    });

  beforeEach(async () => {
    jest.clearAllMocks();

    ordersRepository = {
      findPage: jest.fn(),
      count: jest.fn(),
      findPageByRecipient: jest.fn(),
      countByRecipient: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepositoryPort>;

    cache = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue('1'),
      incr: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<CachePort>;

    cacheKeyBuilder = {
      buildListKey: jest.fn().mockResolvedValue('k'),
      bumpVersion: jest.fn(),
    } as unknown as jest.Mocked<OrdersCacheKeyBuilder>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllOrdersUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: CachePort, useValue: cache },
        { provide: OrdersCacheKeyBuilder, useValue: cacheKeyBuilder },
      ],
    }).compile();

    sut = module.get(FindAllOrdersUseCase);
  });

  it('for internal service, lists all orders', async () => {
    ordersRepository.findPage.mockResolvedValueOnce([makeOrder('a@b.com')]);
    ordersRepository.count.mockResolvedValueOnce(1);

    await sut.execute({ page: 1, limit: 10 }, { mode: 'internal-service' });

    expect(cacheKeyBuilder.buildListKey).toHaveBeenCalledWith(1, 10, 'all');
    expect(ordersRepository.findPage).toHaveBeenCalledWith(1, 10);
    expect(ordersRepository.findPageByRecipient).not.toHaveBeenCalled();
  });

  it('for end-user JWT, lists only orders for that recipient', async () => {
    ordersRepository.findPageByRecipient.mockResolvedValueOnce([makeOrder('me@x.com')]);
    ordersRepository.countByRecipient.mockResolvedValueOnce(1);

    await sut.execute({ page: 1, limit: 10 }, { mode: 'user', email: 'me@x.com' });

    expect(cacheKeyBuilder.buildListKey).toHaveBeenCalledWith(1, 10, {
      recipientEmail: 'me@x.com',
    });
    expect(ordersRepository.findPageByRecipient).toHaveBeenCalledWith('me@x.com', 1, 10);
    expect(ordersRepository.findPage).not.toHaveBeenCalled();
  });
});
