import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { ConfirmOrderUseCase } from '../../../src/application/use-cases/confirm-order.use-case';
import { orderCacheKey } from '../../../src/application/cache/order-cache-key';
import { OrderEntity, OrderStatus } from '../../../src/domain/entities/order.entity';
import { OrderAuditLogPort } from '../../../src/domain/ports/order-audit-log.port';
import { OrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { OrderSummaryPort } from '../../../src/domain/ports/order-summary.port';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('ConfirmOrderUseCase', () => {
  let sut: ConfirmOrderUseCase;
  let ordersRepository: jest.Mocked<OrdersRepositoryPort>;
  let orderEventsPublisher: jest.Mocked<OrderEventsPublisherPort>;
  let orderAuditLog: jest.Mocked<OrderAuditLogPort>;
  let orderSummary: jest.Mocked<OrderSummaryPort>;
  let cache: jest.Mocked<CachePort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const idempotencyKey = crypto.randomUUID();
  const pendingOrder = new OrderEntity({
    id: 'order-1',
    description: 'test order',
    status: OrderStatus.PENDING,
    productId: 'product-123',
    quantity: 2,
    createdAt,
    updatedAt: createdAt,
    recipient: 'test@test.com',
    productName: 'Product A',
    productDescription: 'Description A',
    idempotencyKey,
    unitPrice: 99.9,
    totalPrice: 199.8,
  });
  const confirmedOrder = new OrderEntity({
    id: 'order-1',
    description: 'test order',
    status: OrderStatus.CONFIRMED,
    productId: 'product-123',
    quantity: 2,
    createdAt,
    updatedAt: createdAt,
    recipient: 'test@test.com',
    productName: 'Product A',
    productDescription: 'Description A',
    idempotencyKey,
    unitPrice: 99.9,
    totalPrice: 199.8,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    ordersRepository = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(pendingOrder),
      updateStatus: jest.fn().mockResolvedValue(confirmedOrder),
      confirmIfPending: jest.fn().mockResolvedValue(confirmedOrder),
      cancelIfPending: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepositoryPort>;

    orderEventsPublisher = {
      publishOrderCreationRequested: jest.fn(),
      publishOrderConfirmed: jest.fn().mockResolvedValue(undefined),
      publishInventoryReservedToPayment: jest.fn(),
    } as unknown as jest.Mocked<OrderEventsPublisherPort>;

    orderAuditLog = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<OrderAuditLogPort>;

    orderSummary = {
      put: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<OrderSummaryPort>;

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn(),
      setJson: jest.fn(),
      incr: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<CachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmOrderUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: OrderEventsPublisherPort, useValue: orderEventsPublisher },
        { provide: OrderAuditLogPort, useValue: orderAuditLog },
        { provide: OrderSummaryPort, useValue: orderSummary },
        { provide: CachePort, useValue: cache },
      ],
    }).compile();

    sut = module.get(ConfirmOrderUseCase);
  });

  describe('execute', () => {
    it('updates order to CONFIRMED and publishes OrderConfirmed', async () => {
      const event = { orderId: 'order-1' };

      await sut.execute(event);

      expect(ordersRepository.confirmIfPending).toHaveBeenCalledWith('order-1');
      expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
      expect(orderAuditLog.log).toHaveBeenCalledWith({
        orderId: confirmedOrder.id,
        action: 'ORDER_CONFIRMED',
        timestamp: expect.any(String),
        details: {
          productId: confirmedOrder.productId,
          quantity: confirmedOrder.quantity,
          description: confirmedOrder.description,
          recipient: confirmedOrder.recipient,
        },
      });
      expect(orderSummary.put).toHaveBeenCalledTimes(1);
      expect(orderSummary.put).toHaveBeenCalledWith({
        orderId: confirmedOrder.id,
        status: confirmedOrder.status,
        productId: confirmedOrder.productId,
        quantity: confirmedOrder.quantity,
        description: confirmedOrder.description,
        recipient: confirmedOrder.recipient,
        idempotencyKey: confirmedOrder.idempotencyKey,
        createdAt: confirmedOrder.createdAt.toISOString(),
        updatedAt: expect.any(String),
      });
      expect(orderEventsPublisher.publishOrderConfirmed).toHaveBeenCalledTimes(1);
      const published = orderEventsPublisher.publishOrderConfirmed.mock.calls[0][0];
      expect(published.orderId).toBe('order-1');
      expect(published.productId).toBe('product-123');
      expect(published.quantity).toBe(2);
      expect(published.productName).toBe('Product A');
      expect(published.productDescription).toBe('Description A');
      expect(published.totalPrice).toBe(199.8);
      expect(published.userId).toBe('test@test.com');
      expect(published.recipientEmail).toBe('test@test.com');
      expect(published.confirmedAt).toBeDefined();

      expect(cache.incr).toHaveBeenCalledWith('orders:all:version');
      expect(cache.del).toHaveBeenCalledWith(orderCacheKey('order-1'));
    });

    it('returns without side effects when order is not pending or not found', async () => {
      ordersRepository.confirmIfPending.mockResolvedValueOnce(null);

      await expect(sut.execute({ orderId: 'non-existent' })).resolves.toBeUndefined();

      expect(ordersRepository.confirmIfPending).toHaveBeenCalledWith('non-existent');
      expect(orderAuditLog.log).not.toHaveBeenCalled();
      expect(orderEventsPublisher.publishOrderConfirmed).not.toHaveBeenCalled();
      expect(cache.incr).not.toHaveBeenCalled();
      expect(cache.del).not.toHaveBeenCalled();
    });

    it('publishes OrderConfirmed and completes when orderSummary.put fails', async () => {
      orderSummary.put.mockRejectedValueOnce(new Error('Summary write failed'));

      await expect(sut.execute({ orderId: 'order-1' })).resolves.toBeUndefined();

      expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
      expect(orderEventsPublisher.publishOrderConfirmed).toHaveBeenCalledTimes(1);
    });
  });
});
