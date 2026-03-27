import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { orderCacheKey } from '../../../src/application/cache/order-cache-key';
import { FindOrderByIdUseCase } from '../../../src/application/use-cases/find-order-by-id.use-case';
import { OrderEntity, OrderStatus } from '../../../src/domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';
import type { TOrderAccessContext } from '../../../src/application/types/order-access.context';

describe('FindOrderByIdUseCase', () => {
  let sut: FindOrderByIdUseCase;
  let ordersRepository: jest.Mocked<OrdersRepositoryPort>;
  let cache: jest.Mocked<CachePort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const idempotencyKey = crypto.randomUUID();
  const internalAccess: TOrderAccessContext = { mode: 'internal-service' };
  const userAccess: TOrderAccessContext = { mode: 'user', email: 'test@test.com' };

  const fakeOrder = new OrderEntity({
    id: 'id-123',
    description: 'test order',
    status: OrderStatus.PENDING,
    productId: 'product-123',
    quantity: 1,
    createdAt,
    updatedAt: createdAt,
    recipient: 'test@test.com',
    productName: 'Product A',
    productDescription: 'Description A',
    idempotencyKey,
    unitPrice: 99.9,
    totalPrice: 99.9,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    ordersRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(fakeOrder),
      updateStatus: jest.fn(),
      confirmIfPending: jest.fn(),
      cancelIfPending: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepositoryPort>;

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn(),
    } as unknown as jest.Mocked<CachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOrderByIdUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: CachePort, useValue: cache },
      ],
    }).compile();

    sut = module.get(FindOrderByIdUseCase);
  });

  describe('execute', () => {
    it('returns order when found', async () => {
      const result = await sut.execute('id-123', internalAccess);

      expect(cache.getJson).toHaveBeenCalledWith(orderCacheKey('id-123'));
      expect(ordersRepository.findById).toHaveBeenCalledTimes(1);
      expect(ordersRepository.findById).toHaveBeenCalledWith('id-123');
      expect(cache.setJson).toHaveBeenCalledWith(orderCacheKey('id-123'), fakeOrder, 60 * 5);
      expect(result).toEqual(fakeOrder);
    });

    it('returns cached order without hitting repository', async () => {
      cache.getJson.mockResolvedValueOnce(fakeOrder);

      const result = await sut.execute('id-123', internalAccess);

      expect(result).toEqual(fakeOrder);
      expect(ordersRepository.findById).not.toHaveBeenCalled();
      expect(cache.setJson).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when order does not exist', async () => {
      ordersRepository.findById.mockResolvedValueOnce(null);

      await expect(sut.execute('non-existent', internalAccess)).rejects.toThrow(NotFoundException);
      expect(cache.setJson).not.toHaveBeenCalled();
    });

    it('propagates error when repository throws', async () => {
      ordersRepository.findById.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute('id-123', internalAccess)).rejects.toThrow('DB failed');
    });

    it('allows owner JWT to read order', async () => {
      const result = await sut.execute('id-123', userAccess);
      expect(result).toEqual(fakeOrder);
    });

    it('rejects JWT for another recipient (cached)', async () => {
      cache.getJson.mockResolvedValueOnce(fakeOrder);

      await expect(sut.execute('id-123', { mode: 'user', email: 'other@test.com' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects JWT for another recipient (repository)', async () => {
      await expect(sut.execute('id-123', { mode: 'user', email: 'other@test.com' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
