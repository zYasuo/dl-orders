import { Test, TestingModule } from '@nestjs/testing';
import { HandleOrderCreationRequestedUseCase } from '../../../src/application/use-cases/handle-order-creation-requested.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { IInventoryEventsPublisherPort } from '../../../src/domain/ports/inventory-events-publisher.port';
import { IInventoryListCachePort } from '../../../src/domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { IReservationAuditLogPort } from '../../../src/domain/ports/reservation-audit-log.port';

describe('HandleOrderCreationRequestedUseCase', () => {
  let sut: HandleOrderCreationRequestedUseCase;
  let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;
  let eventsPublisher: jest.Mocked<IInventoryEventsPublisherPort>;
  let reservationAuditLog: jest.Mocked<IReservationAuditLogPort>;
  let listCache: jest.Mocked<IInventoryListCachePort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const fakeInventory = new InventoryEntity(
    'inv-1',
    'Warehouse',
    10,
    100,
    1,
    5,
    'product-123',
    createdAt,
    createdAt,
  );
  const reducedInventory = new InventoryEntity(
    'inv-1',
    'Warehouse',
    7,
    100,
    1,
    5,
    'product-123',
    createdAt,
    createdAt,
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    inventoryRepository = {
      findByProductId: jest.fn().mockResolvedValue(fakeInventory),
      decrementStock: jest.fn().mockResolvedValue(reducedInventory),
      create: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IInventoryRepositoryPort>;

    eventsPublisher = {
      publishInventoryReserved: jest.fn().mockResolvedValue(undefined),
      publishInventoryReservationFailed: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IInventoryEventsPublisherPort>;

    reservationAuditLog = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<IReservationAuditLogPort>;

    listCache = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IInventoryListCachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleOrderCreationRequestedUseCase,
        { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
        { provide: IInventoryEventsPublisherPort, useValue: eventsPublisher },
        { provide: IReservationAuditLogPort, useValue: reservationAuditLog },
        { provide: IInventoryListCachePort, useValue: listCache },
      ],
    }).compile();

    sut = module.get(HandleOrderCreationRequestedUseCase);
  });

  const baseEvent = {
    orderId: 'order-1',
    productId: 'product-123',
    productName: 'Product A',
    productDescription: 'Description A',
    idempotencyKey: 'test-idempotency-key',
    totalPrice: 99.9,
    userId: 'user-123',
    quantity: 3,
    recipientEmail: 'a@b.com',
  };

  describe('execute', () => {
    it('reduces stock and publishes inventory.reserved when sufficient', async () => {
      await sut.execute(baseEvent);

      expect(reservationAuditLog.log).toHaveBeenCalledTimes(2);
      expect(reservationAuditLog.log).toHaveBeenNthCalledWith(1, {
        orderId: 'order-1',
        action: 'RESERVATION_REQUESTED',
        timestamp: expect.any(String),
        details: { productId: 'product-123', quantity: 3 },
      });
      expect(reservationAuditLog.log).toHaveBeenNthCalledWith(2, {
        orderId: 'order-1',
        action: 'RESERVED',
        timestamp: expect.any(String),
        details: { productId: 'product-123', quantity: 3 },
      });
      expect(inventoryRepository.findByProductId).toHaveBeenCalledWith('product-123');
      expect(inventoryRepository.decrementStock).toHaveBeenCalledWith('inv-1', 3);
      expect(eventsPublisher.publishInventoryReserved).toHaveBeenCalledWith({
        orderId: 'order-1',
        productId: 'product-123',
        quantity: 3,
      });
      expect(eventsPublisher.publishInventoryReservationFailed).not.toHaveBeenCalled();
      expect(listCache.invalidate).toHaveBeenCalledTimes(1);
    });

    it('publishes reservation_failed when no inventory for product', async () => {
      inventoryRepository.findByProductId.mockResolvedValueOnce(null);

      await sut.execute(baseEvent);

      expect(reservationAuditLog.log).toHaveBeenCalledTimes(2);
      expect(reservationAuditLog.log).toHaveBeenNthCalledWith(1, {
        orderId: 'order-1',
        action: 'RESERVATION_REQUESTED',
        timestamp: expect.any(String),
        details: { productId: 'product-123', quantity: 3 },
      });

      expect(reservationAuditLog.log).toHaveBeenNthCalledWith(2, {
        orderId: 'order-1',
        action: 'RESERVATION_FAILED',
        timestamp: expect.any(String),
        details: {
          productId: 'product-123',
          quantity: 3,
          reason: 'Inventory not available for this product',
        },
      });

      expect(eventsPublisher.publishInventoryReservationFailed).toHaveBeenCalledWith({
        orderId: 'order-1',
        productId: 'product-123',
        quantity: 3,
        reason: 'Inventory not available for this product',
      });

      expect(eventsPublisher.publishInventoryReserved).not.toHaveBeenCalled();
      expect(inventoryRepository.decrementStock).not.toHaveBeenCalled();
    });

    it('publishes reservation_failed when decrementStock returns null', async () => {
      inventoryRepository.decrementStock.mockResolvedValueOnce(null);

      await sut.execute(baseEvent);

      expect(reservationAuditLog.log).toHaveBeenCalledTimes(2);
      expect(reservationAuditLog.log).toHaveBeenNthCalledWith(2, {
        orderId: 'order-1',
        action: 'RESERVATION_FAILED',
        timestamp: expect.any(String),
        details: {
          productId: 'product-123',
          quantity: 3,
          reason: 'Insufficient inventory quantity',
        },
      });
      expect(eventsPublisher.publishInventoryReservationFailed).toHaveBeenCalledWith({
        orderId: 'order-1',
        productId: 'product-123',
        quantity: 3,
        reason: 'Insufficient inventory quantity',
      });
    });
  });
});
