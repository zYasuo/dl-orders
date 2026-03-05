import { Test, TestingModule } from '@nestjs/testing';
import { HandleOrderCreationRequestedUseCase } from '../../../src/application/use-cases/handle-order-creation-requested.use-case';
import { Inventory } from '../../../src/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { IInventoryEventsPublisherPort } from '../../../src/domain/ports/inventory-events-publisher.port';

describe('HandleOrderCreationRequestedUseCase', () => {
    let sut: HandleOrderCreationRequestedUseCase;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;
    let eventsPublisher: jest.Mocked<IInventoryEventsPublisherPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeInventory = new Inventory('inv-1', 'Warehouse', 10, 'product-123', createdAt, createdAt);
    const reducedInventory = new Inventory('inv-1', 'Warehouse', 7, 'product-123', createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        inventoryRepository = {
            findByProductId: jest.fn().mockResolvedValue(fakeInventory),
            updateProductAvailable: jest.fn().mockResolvedValue(reducedInventory),
            create: jest.fn(),
            findByName: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IInventoryRepositoryPort>;

        eventsPublisher = {
            publishInventoryReserved: jest.fn().mockResolvedValue(undefined),
            publishInventoryReservationFailed: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IInventoryEventsPublisherPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HandleOrderCreationRequestedUseCase,
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
                { provide: IInventoryEventsPublisherPort, useValue: eventsPublisher },
            ],
        }).compile();

        sut = module.get(HandleOrderCreationRequestedUseCase);
    });

    const baseEvent = { orderId: 'order-1', productId: 'product-123', quantity: 3, description: 'test', recipient: 'a@b.com' };

    describe('execute', () => {
        it('reduces stock and publishes inventory.reserved when sufficient', async () => {
            await sut.execute(baseEvent);

            expect(inventoryRepository.findByProductId).toHaveBeenCalledWith('product-123');
            expect(inventoryRepository.updateProductAvailable).toHaveBeenCalledWith('inv-1', 7);
            expect(eventsPublisher.publishInventoryReserved).toHaveBeenCalledWith({
                orderId: 'order-1',
                productId: 'product-123',
                quantity: 3,
            });
            expect(eventsPublisher.publishInventoryReservationFailed).not.toHaveBeenCalled();
        });

        it('publishes reservation_failed when no inventory for product', async () => {
            inventoryRepository.findByProductId.mockResolvedValueOnce(null);

            await sut.execute(baseEvent);

            expect(eventsPublisher.publishInventoryReservationFailed).toHaveBeenCalledWith({
                orderId: 'order-1',
                productId: 'product-123',
                quantity: 3,
                reason: 'Inventory not available for this product',
            });
            expect(eventsPublisher.publishInventoryReserved).not.toHaveBeenCalled();
            expect(inventoryRepository.updateProductAvailable).not.toHaveBeenCalled();
        });

        it('publishes reservation_failed when insufficient stock', async () => {
            await sut.execute({ ...baseEvent, quantity: 100 });

            expect(eventsPublisher.publishInventoryReservationFailed).toHaveBeenCalledWith({
                orderId: 'order-1',
                productId: 'product-123',
                quantity: 100,
                reason: 'Insufficient inventory quantity',
            });
            expect(eventsPublisher.publishInventoryReserved).not.toHaveBeenCalled();
        });

        it('publishes reservation_failed when update returns null', async () => {
            inventoryRepository.updateProductAvailable.mockResolvedValueOnce(null);

            await sut.execute(baseEvent);

            expect(eventsPublisher.publishInventoryReservationFailed).toHaveBeenCalledWith({
                orderId: 'order-1',
                productId: 'product-123',
                quantity: 3,
                reason: 'Failed to update inventory',
            });
        });
    });
});
