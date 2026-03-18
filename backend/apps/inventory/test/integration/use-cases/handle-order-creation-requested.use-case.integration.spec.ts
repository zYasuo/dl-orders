import { Test, TestingModule } from '@nestjs/testing';
import { HandleOrderCreationRequestedUseCase } from '../../../src/application/use-cases/handle-order-creation-requested.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { IInventoryEventsPublisherPort } from '../../../src/domain/ports/inventory-events-publisher.port';
import { IInventoryListCachePort } from '../../../src/domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { IReservationAuditLogPort } from '../../../src/domain/ports/reservation-audit-log.port';
import { FakeInventoryEventsPublisher } from '../../doubles/fake-inventory-events.publisher';
import { InMemoryInventoryListCache } from '../../doubles/in-memory-inventory-list-cache';
import { InMemoryInventoryRepository } from '../../doubles/in-memory-inventory.repository';

describe('HandleOrderCreationRequestedUseCase (integration)', () => {
  let sut: HandleOrderCreationRequestedUseCase;
  let repository: InMemoryInventoryRepository;
  let eventsPublisher: FakeInventoryEventsPublisher;
  let listCache: InMemoryInventoryListCache;

  const productId = 'product-1';
  const inventoryId = 'inventory-1';
  const initialQuantity = 10;
  const now = new Date();

  beforeEach(async () => {
    repository = new InMemoryInventoryRepository();
    repository.seed(
      new InventoryEntity(
        inventoryId,
        'Product A',
        initialQuantity,
        100,
        1,
        5,
        productId,
        now,
        now,
      ),
    );
    eventsPublisher = new FakeInventoryEventsPublisher();
    listCache = new InMemoryInventoryListCache();
    const reservationAuditLog: IReservationAuditLogPort = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleOrderCreationRequestedUseCase,
        { provide: IInventoryRepositoryPort, useValue: repository },
        { provide: IInventoryEventsPublisherPort, useValue: eventsPublisher },
        { provide: IReservationAuditLogPort, useValue: reservationAuditLog },
        { provide: IInventoryListCachePort, useValue: listCache },
      ],
    }).compile();

    sut = module.get(HandleOrderCreationRequestedUseCase);
  });

  describe('execute', () => {
    it('reduces inventory and publishes reserved', async () => {
      await sut.execute({
        orderId: 'o1',
        productId,
        quantity: 3,
        productName: 'Product A',
        productDescription: 'test',
        idempotencyKey: 'ik-1',
        totalPrice: 10,
        userId: 'u1',
        recipientEmail: 'a@b.com',
      });

      expect(repository.getQuantity(inventoryId)).toBe(initialQuantity - 3);
      expect(eventsPublisher.reserved).toHaveLength(1);
      expect(eventsPublisher.reserved[0].orderId).toBe('o1');
      expect(eventsPublisher.failed).toHaveLength(0);
    });

    it('publishes failed when no inventory for product', async () => {
      await sut.execute({
        orderId: 'o1',
        productId: 'non-existent',
        quantity: 1,
        productName: 'X',
        productDescription: 't',
        idempotencyKey: 'ik-2',
        totalPrice: 1,
        userId: 'u1',
        recipientEmail: 'a@b.com',
      });

      expect(eventsPublisher.failed).toHaveLength(1);
      expect(eventsPublisher.reserved).toHaveLength(0);
    });

    it('publishes failed when quantity exceeds stock', async () => {
      await sut.execute({
        orderId: 'o1',
        productId,
        quantity: initialQuantity + 5,
        productName: 'X',
        productDescription: 't',
        idempotencyKey: 'ik-3',
        totalPrice: 1,
        userId: 'u1',
        recipientEmail: 'a@b.com',
      });

      expect(eventsPublisher.failed).toHaveLength(1);
      expect(eventsPublisher.reserved).toHaveLength(0);
    });
  });
});
