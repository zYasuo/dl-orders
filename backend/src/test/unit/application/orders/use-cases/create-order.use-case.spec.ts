import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Inventory } from '../../../../../inventory/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../../../inventory/domain/ports/inventory-repository.port';
import { CreateOrderUseCase } from '../../../../../orders/application/use-cases/create-order.use-case';
import { Order, OrderStatus } from '../../../../../orders/domain/entities/order.entity';
import { OrderWasCreatedEvent } from '../../../../../orders/domain/events/order-was-created.event';
import { IOrderEventsPublisherPort } from '../../../../../orders/domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../../../../orders/domain/ports/orders-repository.port';

describe('CreateOrderUseCase', () => {
    let sut: CreateOrderUseCase;
    let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;
    let orderEventsPublisher: jest.Mocked<IOrderEventsPublisherPort>;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeInventory = new Inventory('inv-1', 'Estoque Produto', 10, 'product-123', createdAt, createdAt);
    const fakeOrder = new Order({
        id: 'id-123',
        description: 'test order',
        status: OrderStatus.PENDING,
        productId: 'product-123',
        quantity: 1,
        createdAt,
        updatedAt: createdAt,
        recipient: 'test@test.com',
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        ordersRepository = {
            create: jest.fn().mockResolvedValue(fakeOrder),
            findById: jest.fn(),
        } as unknown as jest.Mocked<IOrdersRepositoryPort>;

        orderEventsPublisher = {
            publishOrderWasCreated: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IOrderEventsPublisherPort>;

        inventoryRepository = {
            findByProductId: jest.fn().mockResolvedValue(fakeInventory),
            create: jest.fn(),
            findByName: jest.fn(),
            updateProductAvailable: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IInventoryRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
                { provide: IOrderEventsPublisherPort, useValue: orderEventsPublisher },
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
            ],
        }).compile();

        sut = module.get(CreateOrderUseCase);
    });

    describe('execute', () => {
        it('persists order, publishes OrderWasCreated and returns the order', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'test order', recipient: 'test@test.com' };

            const result = await sut.execute(input);

            expect(inventoryRepository.findByProductId).toHaveBeenCalledWith('product-123');
            expect(ordersRepository.create).toHaveBeenCalledTimes(1);
            expect(ordersRepository.create).toHaveBeenCalledWith({
                productId: input.productId,
                quantity: input.quantity,
                description: input.description,
                recipient: input.recipient,
            });

            expect(orderEventsPublisher.publishOrderWasCreated).toHaveBeenCalledTimes(1);
            const event = orderEventsPublisher.publishOrderWasCreated.mock.calls[0][0];
            expect(event).toBeInstanceOf(OrderWasCreatedEvent);
            expect(event.order).toEqual(fakeOrder);

            expect(result).toEqual(fakeOrder);
        });

        it('throws NotFoundException when product has no inventory', async () => {
            const input = { productId: 'non-existent', quantity: 1, description: 'order', recipient: 'test@test.com' };
            inventoryRepository.findByProductId.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(
                new NotFoundException('Inventory not available for this product'),
            );

            expect(ordersRepository.create).not.toHaveBeenCalled();
            expect(orderEventsPublisher.publishOrderWasCreated).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when available quantity is not enough', async () => {
            const input = { productId: 'product-123', quantity: 100, description: 'order', recipient: 'test@test.com' };
            inventoryRepository.findByProductId.mockResolvedValueOnce(fakeInventory);

            await expect(sut.execute(input)).rejects.toThrow(
                new BadRequestException('Inventory quantity is not enough'),
            );

            expect(ordersRepository.create).not.toHaveBeenCalled();
            expect(orderEventsPublisher.publishOrderWasCreated).not.toHaveBeenCalled();
        });

        it('does not publish event when repository throws', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'order', recipient: 'test@test.com' };
            ordersRepository.create.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');

            expect(orderEventsPublisher.publishOrderWasCreated).not.toHaveBeenCalled();
        });
    });
});
