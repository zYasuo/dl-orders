import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case';
import { OrderStatus } from '../../../src/domain/entities/order.entity';
import { OrderAuditLogPort } from '../../../src/domain/ports/order-audit-log.port';
import { OrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { ProductCatalogPort } from '../../../src/domain/ports/product-catalog.port';
import { OrderSummaryPort } from '../../../src/domain/ports/order-summary.port';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';
import { FakeOrderEventsPublisher } from '../../doubles/fake-order-events.publisher';
import { InMemoryOrdersRepository } from '../../doubles/in-memory-orders.repository';
import type { TOrderAccessContext } from '../../../src/application/types/order-access.context';

describe('CreateOrderUseCase (integration)', () => {
  let sut: CreateOrderUseCase;
  let ordersRepository: InMemoryOrdersRepository;
  let orderEventsPublisher: FakeOrderEventsPublisher;

  beforeEach(async () => {
    ordersRepository = new InMemoryOrdersRepository();
    orderEventsPublisher = new FakeOrderEventsPublisher();
    const productCatalog: ProductCatalogPort = {
      findById: jest
        .fn()
        .mockResolvedValue({ name: 'Product A', description: 'Desc', price: 99.9 }),
    };
    const orderAuditLog: OrderAuditLogPort = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    };
    const orderSummary: OrderSummaryPort = {
      put: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue(null),
    };

    const cache: CachePort = {
      get: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn(),
      setJson: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn().mockResolvedValue(1),
    } as unknown as CachePort;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: ProductCatalogPort, useValue: productCatalog },
        { provide: OrderEventsPublisherPort, useValue: orderEventsPublisher },
        { provide: OrderAuditLogPort, useValue: orderAuditLog },
        { provide: OrderSummaryPort, useValue: orderSummary },
        { provide: CachePort, useValue: cache },
      ],
    }).compile();

    sut = module.get(CreateOrderUseCase);
  });

  describe('execute', () => {
    it('persists order as PENDING and publishes OrderCreationRequested', async () => {
      const userAccess: TOrderAccessContext = { mode: 'user', email: 'test@test.com' };
      const input = {
        productId: 'product-123',
        quantity: 1,
        description: 'test order',
        recipient: 'test@test.com',
        idempotencyKey: crypto.randomUUID(),
      };

      const result = await sut.execute(input, userAccess);

      expect(result.status).toBe(OrderStatus.PENDING);

      const found = await ordersRepository.findById(result.id);
      expect(found).not.toBeNull();
      expect(found!.productId).toBe(input.productId);
      expect(found!.quantity).toBe(input.quantity);
      expect(found!.description).toBe(input.description);
      expect(found!.recipient).toBe(input.recipient);

      expect(orderEventsPublisher.creationRequested).toHaveLength(1);
      expect(orderEventsPublisher.creationRequested[0].orderId).toBe(result.id);
      expect(orderEventsPublisher.creationRequested[0].productId).toBe(input.productId);
    });
  });
});
