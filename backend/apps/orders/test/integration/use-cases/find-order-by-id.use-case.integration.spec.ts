import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { FindOrderByIdUseCase } from '../../../src/application/use-cases/find-order-by-id.use-case';
import { OrderEntity } from '../../../src/domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';
import { InMemoryOrdersRepository } from '../../doubles/in-memory-orders.repository';
import type { TOrderAccessContext } from '../../../src/application/types/order-access.context';

describe('FindOrderByIdUseCase (integration)', () => {
  let sut: FindOrderByIdUseCase;
  let ordersRepository: InMemoryOrdersRepository;

  beforeEach(async () => {
    ordersRepository = new InMemoryOrdersRepository();

    const cache: CachePort = {
      get: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn(),
    } as unknown as CachePort;

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
      const ownerAccess: TOrderAccessContext = { mode: 'user', email: 'test@test.com' };
      const created = await ordersRepository.create(
        OrderEntity.create({
          productId: '123',
          quantity: 1,
          description: 'order 1',
          recipient: 'test@test.com',
          productName: 'Product',
          productDescription: 'Desc',
          idempotencyKey: crypto.randomUUID(),
          unitPrice: 10,
        }),
      );

      const result = await sut.execute(created.id, ownerAccess);
      expect(result.id).toBe(created.id);
      expect(result.productId).toBe(created.productId);
    });

    it('throws NotFoundException when order does not exist', async () => {
      const internalAccess: TOrderAccessContext = { mode: 'internal-service' };
      await expect(sut.execute('non-existent-id', internalAccess)).rejects.toThrow(NotFoundException);
    });
  });
});
