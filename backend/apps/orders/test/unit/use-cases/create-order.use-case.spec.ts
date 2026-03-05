import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case';
import { Order, OrderStatus } from '../../../src/domain/entities/order.entity';
import { IOrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('CreateOrderUseCase', () => {
    let sut: CreateOrderUseCase;
    let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;
    let orderEventsPublisher: jest.Mocked<IOrderEventsPublisherPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
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
            updateStatus: jest.fn(),
        } as unknown as jest.Mocked<IOrdersRepositoryPort>;

        orderEventsPublisher = {
            publishOrderCreationRequested: jest.fn().mockResolvedValue(undefined),
            publishOrderConfirmed: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IOrderEventsPublisherPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
                { provide: IOrderEventsPublisherPort, useValue: orderEventsPublisher },
            ],
        }).compile();

        sut = module.get(CreateOrderUseCase);
    });

    describe('execute', () => {
        it('persists order as PENDING and publishes OrderCreationRequested', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'test order', recipient: 'test@test.com' };

            const result = await sut.execute(input);

            expect(ordersRepository.create).toHaveBeenCalledTimes(1);
            expect(ordersRepository.create).toHaveBeenCalledWith({
                productId: input.productId,
                quantity: input.quantity,
                description: input.description,
                recipient: input.recipient,
            });

            expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledTimes(1);
            expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledWith({
                orderId: fakeOrder.id,
                productId: fakeOrder.productId,
                quantity: fakeOrder.quantity,
                description: fakeOrder.description,
                recipient: fakeOrder.recipient,
            });

            expect(result).toEqual(fakeOrder);
        });

        it('throws InternalServerErrorException when repository returns null', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'order', recipient: 'test@test.com' };
            ordersRepository.create.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(
                new InternalServerErrorException('Failed to create order'),
            );

            expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
        });

        it('does not publish event when repository throws', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'order', recipient: 'test@test.com' };
            ordersRepository.create.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');

            expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
        });
    });
});
