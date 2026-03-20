import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case';
import { OrderEntity, OrderStatus } from '../../../src/domain/entities/order.entity';
import { OrderAuditLogPort } from '../../../src/domain/ports/order-audit-log.port';
import { OrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { ProductCatalogPort } from '../../../src/domain/ports/product-catalog.port';
import { OrderSummaryPort } from '../../../src/domain/ports/order-summary.port';
import { OrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('CreateOrderUseCase', () => {
  let sut: CreateOrderUseCase;
  let ordersRepository: jest.Mocked<OrdersRepositoryPort>;
  let productCatalogPort: jest.Mocked<ProductCatalogPort>;
  let orderEventsPublisher: jest.Mocked<OrderEventsPublisherPort>;
  let orderAuditLog: jest.Mocked<OrderAuditLogPort>;
  let orderSummary: jest.Mocked<OrderSummaryPort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const idempotencyKey = crypto.randomUUID();
  const fakeProduct = { name: 'Product A', description: 'Description A', price: 99.9 };
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
      create: jest.fn().mockResolvedValue(fakeOrder),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      confirmIfPending: jest.fn(),
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<OrdersRepositoryPort>;

    productCatalogPort = {
      findById: jest.fn().mockResolvedValue(fakeProduct),
    } as unknown as jest.Mocked<ProductCatalogPort>;

    orderEventsPublisher = {
      publishOrderCreationRequested: jest.fn().mockResolvedValue(undefined),
      publishOrderConfirmed: jest.fn().mockResolvedValue(undefined),
      publishInventoryReservedToPayment: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OrderEventsPublisherPort>;

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
        CreateOrderUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: ProductCatalogPort, useValue: productCatalogPort },
        { provide: OrderEventsPublisherPort, useValue: orderEventsPublisher },
        { provide: OrderAuditLogPort, useValue: orderAuditLog },
        { provide: OrderSummaryPort, useValue: orderSummary },
      ],
    }).compile();

    sut = module.get(CreateOrderUseCase);
  });

  describe('execute', () => {
    it('fetches product, persists order with totalPrice = quantity * price, and publishes OrderCreationRequested', async () => {
      const input = {
        productId: 'product-123',
        quantity: 1,
        description: 'test order',
        recipient: 'test@test.com',
        idempotencyKey,
      };

      const result = await sut.execute(input);

      expect(productCatalogPort.findById).toHaveBeenCalledWith('product-123');
      expect(ordersRepository.create).toHaveBeenCalledTimes(1);
      expect(ordersRepository.create).toHaveBeenCalledWith({
        productId: input.productId,
        quantity: input.quantity,
        description: input.description,
        recipient: input.recipient,
        productName: 'Product A',
        productDescription: 'Description A',
        unitPrice: 99.9,
        totalPrice: 99.9,
        idempotencyKey,
      });

      expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
      expect(orderAuditLog.log).toHaveBeenCalledWith({
        orderId: fakeOrder.id,
        action: 'ORDER_CREATED',
        timestamp: expect.any(String),
        details: {
          productId: fakeOrder.productId,
          quantity: fakeOrder.quantity,
          description: fakeOrder.description,
          recipient: fakeOrder.recipient,
          idempotencyKey,
        },
      });

      expect(orderSummary.put).toHaveBeenCalledTimes(1);
      expect(orderSummary.put).toHaveBeenCalledWith({
        orderId: fakeOrder.id,
        status: fakeOrder.status,
        productId: fakeOrder.productId,
        quantity: fakeOrder.quantity,
        description: fakeOrder.description,
        recipient: fakeOrder.recipient,
        createdAt: fakeOrder.createdAt.toISOString(),
        updatedAt: expect.any(String),
        idempotencyKey,
      });

      expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledTimes(1);
      expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledWith({
        orderId: fakeOrder.id,
        productId: fakeOrder.productId,
        productName: 'Product A',
        productDescription: 'Description A',
        totalPrice: 99.9,
        userId: 'test@test.com',
        quantity: fakeOrder.quantity,
        recipientEmail: 'test@test.com',
        idempotencyKey,
      });

      expect(result).toEqual(fakeOrder);
    });

    it('throws NotFoundException when product does not exist', async () => {
      const input = {
        productId: 'product-123',
        quantity: 1,
        description: 'order',
        recipient: 'test@test.com',
        idempotencyKey,
      };
      productCatalogPort.findById.mockResolvedValueOnce(null);

      await expect(sut.execute(input)).rejects.toThrow(new NotFoundException('Product not found'));

      expect(ordersRepository.create).not.toHaveBeenCalled();
      expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
    });

    it('does not publish event when repository throws', async () => {
      const input = {
        productId: 'product-123',
        quantity: 1,
        description: 'order',
        recipient: 'test@test.com',
        idempotencyKey,
      };
      ordersRepository.create.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute(input)).rejects.toThrow('DB failed');

      expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
    });

    it('uses empty string for productDescription when product.description is null/undefined', async () => {
      const input = {
        productId: 'product-123',
        quantity: 1,
        description: 'order',
        recipient: 'test@test.com',
        idempotencyKey,
      };
      productCatalogPort.findById.mockResolvedValueOnce({
        name: 'Product A',
        description: null,
        price: 99.9,
      });

      await sut.execute(input);

      expect(ordersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productDescription: '',
          idempotencyKey,
        }),
      );
    });

    it('calculates totalPrice as quantity * unitPrice when quantity > 1', async () => {
      const input = {
        productId: 'product-123',
        quantity: 3,
        description: 'order',
        recipient: 'test@test.com',
        idempotencyKey,
      };
      const orderWithTotal = new OrderEntity({
        id: fakeOrder.id,
        productId: fakeOrder.productId,
        quantity: 3,
        description: fakeOrder.description,
        recipient: fakeOrder.recipient,
        productName: fakeOrder.productName,
        productDescription: fakeOrder.productDescription,
        idempotencyKey,
        unitPrice: fakeOrder.unitPrice,
        totalPrice: 299.7,
        status: fakeOrder.status,
        createdAt: fakeOrder.createdAt,
        updatedAt: fakeOrder.updatedAt,
      });
      ordersRepository.create.mockResolvedValueOnce(orderWithTotal);

      const result = await sut.execute(input);

      expect(ordersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 3,
          unitPrice: 99.9,
          totalPrice: expect.any(Number),
        }),
      );
      const createCall = ordersRepository.create.mock.calls[0][0];
      expect(createCall.totalPrice).toBeCloseTo(299.7, 10);
      expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 3,
        }),
      );
      expect(
        orderEventsPublisher.publishOrderCreationRequested.mock.calls[0][0].totalPrice,
      ).toBeCloseTo(299.7, 10);
      expect(result.totalPrice).toBeCloseTo(299.7, 10);
    });

    it('returns order and publishes event when orderSummary.put fails', async () => {
      const input = {
        productId: 'product-123',
        quantity: 1,
        description: 'order',
        recipient: 'test@test.com',
        idempotencyKey,
      };
      orderSummary.put.mockRejectedValueOnce(new Error('Summary write failed'));

      const result = await sut.execute(input);

      expect(result).toEqual(fakeOrder);
      expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledTimes(1);
      expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
    });
  });
});
