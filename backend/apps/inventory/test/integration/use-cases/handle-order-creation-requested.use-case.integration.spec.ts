import { Test, TestingModule } from '@nestjs/testing';
import { HandleOrderCreationRequestedUseCase } from '../../../src/application/use-cases/handle-order-creation-requested.use-case';
import { Inventory } from '../../../src/domain/entities/inventory.entity';
import { IInventoryEventsPublisherPort } from '../../../src/domain/ports/inventory-events-publisher.port';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { IReservationAuditLogPort } from '../../../src/domain/ports/reservation-audit-log.port';
import { InMemoryInventoryRepository } from '../../doubles/in-memory-inventory.repository';
import { FakeInventoryEventsPublisher } from '../../doubles/fake-inventory-events.publisher';

describe('HandleOrderCreationRequestedUseCase (integration)', () => {
    let sut: HandleOrderCreationRequestedUseCase;
    let repository: InMemoryInventoryRepository;
    let eventsPublisher: FakeInventoryEventsPublisher;

    const productId = 'product-1';
    const inventoryId = 'inventory-1';
    const initialQuantity = 10;

    beforeEach(async () => {
        repository = new InMemoryInventoryRepository();
        repository.seed(new Inventory(inventoryId, 'Product A', initialQuantity, productId, new Date(), new Date()));
        eventsPublisher = new FakeInventoryEventsPublisher();
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
            ],
        }).compile();

        sut = module.get(HandleOrderCreationRequestedUseCase);
    });

    describe('execute', () => {
        it('reduces inventory and publishes reserved', async () => {
            await sut.execute({ orderId: 'o1', productId, quantity: 3, description: 'test', recipient: 'a@b.com' });

            expect(repository.getQuantity(inventoryId)).toBe(initialQuantity - 3);
            expect(eventsPublisher.reserved).toHaveLength(1);
            expect(eventsPublisher.reserved[0].orderId).toBe('o1');
            expect(eventsPublisher.failed).toHaveLength(0);
        });

        it('publishes failed when no inventory for product', async () => {
            await sut.execute({ orderId: 'o1', productId: 'non-existent', quantity: 1, description: 't', recipient: 'a@b.com' });

            expect(eventsPublisher.failed).toHaveLength(1);
            expect(eventsPublisher.reserved).toHaveLength(0);
        });

        it('publishes failed when quantity exceeds stock', async () => {
            await sut.execute({ orderId: 'o1', productId, quantity: initialQuantity + 5, description: 't', recipient: 'a@b.com' });

            expect(eventsPublisher.failed).toHaveLength(1);
            expect(eventsPublisher.reserved).toHaveLength(0);
        });
    });
});
