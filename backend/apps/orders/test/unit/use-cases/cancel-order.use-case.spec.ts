import { Test, TestingModule } from '@nestjs/testing';
import { CancelOrderUseCase } from '../../../src/application/use-cases/cancel-order.use-case';
import { OrderEntity, OrderStatus } from '../../../src/domain/entities/order.entity';
import { OrderAuditLogPort } from '../../../src/domain/ports/order-audit-log.port';
import { OrderSummaryPort } from '../../../src/domain/ports/order-summary.port';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('CancelOrderUseCase', () => {
  let sut: CancelOrderUseCase;
  let ordersRepository: jest.Mocked<OrdersRepositoryPort>;
  let orderAuditLog: jest.Mocked<OrderAuditLogPort>;
  let orderSummary: jest.Mocked<OrderSummaryPort>;

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
  const cancelledOrder = new OrderEntity({
    id: 'order-1',
    description: 'test order',
    status: OrderStatus.CANCELLED,
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
      updateStatus: jest.fn().mockResolvedValue(cancelledOrder),
      confirmIfPending: jest.fn(),
      cancelIfPending: jest.fn().mockResolvedValue(cancelledOrder),
    } as unknown as jest.Mocked<OrdersRepositoryPort>;

    orderAuditLog = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<OrderAuditLogPort>;

    orderSummary = {
      put: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<OrderSummaryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelOrderUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: OrderAuditLogPort, useValue: orderAuditLog },
        { provide: OrderSummaryPort, useValue: orderSummary },
      ],
    }).compile();

    sut = module.get(CancelOrderUseCase);
  });

  describe('execute', () => {
    it('updates order to CANCELLED', async () => {
      const event = { orderId: 'order-1', reason: 'Insufficient stock' };

      await sut.execute(event);

      expect(ordersRepository.cancelIfPending).toHaveBeenCalledWith('order-1');
      expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
      expect(orderAuditLog.log).toHaveBeenCalledWith({
        orderId: cancelledOrder.id,
        action: 'ORDER_CANCELLED',
        timestamp: expect.any(String),
        details: { reason: event.reason },
      });
      expect(orderSummary.put).toHaveBeenCalledTimes(1);
      expect(orderSummary.put).toHaveBeenCalledWith({
        orderId: cancelledOrder.id,
        status: cancelledOrder.status,
        productId: cancelledOrder.productId,
        quantity: cancelledOrder.quantity,
        description: cancelledOrder.description,
        recipient: cancelledOrder.recipient,
        idempotencyKey: cancelledOrder.idempotencyKey,
        createdAt: cancelledOrder.createdAt.toISOString(),
        updatedAt: expect.any(String),
      });
    });

    it('returns without side effects when order is not pending or not found', async () => {
      ordersRepository.cancelIfPending.mockResolvedValueOnce(null);

      await expect(
        sut.execute({ orderId: 'non-existent', reason: 'test' }),
      ).resolves.toBeUndefined();

      expect(ordersRepository.cancelIfPending).toHaveBeenCalledWith('non-existent');
      expect(orderAuditLog.log).not.toHaveBeenCalled();
    });

    it('completes without throwing when orderSummary.put fails', async () => {
      const event = { orderId: 'order-1', reason: 'Insufficient stock' };
      orderSummary.put.mockRejectedValueOnce(new Error('Summary write failed'));

      await expect(sut.execute(event)).resolves.toBeUndefined();

      expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
    });
  });
});
