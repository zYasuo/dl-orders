import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CancelOrderUseCase } from '../../../src/application/use-cases/cancel-order.use-case';
import { Order, OrderStatus } from '../../../src/domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('CancelOrderUseCase', () => {
    let sut: CancelOrderUseCase;
    let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const cancelledOrder = new Order({
        id: 'order-1',
        description: 'test order',
        status: OrderStatus.CANCELLED,
        productId: 'product-123',
        quantity: 2,
        createdAt,
        updatedAt: createdAt,
        recipient: 'test@test.com',
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        ordersRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn().mockResolvedValue(cancelledOrder),
        } as unknown as jest.Mocked<IOrdersRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
            ],
        }).compile();

        sut = module.get(CancelOrderUseCase);
    });

    describe('execute', () => {
        it('updates order to CANCELLED', async () => {
            const event = { orderId: 'order-1', productId: 'product-123', quantity: 2, reason: 'Insufficient stock' };

            await sut.execute(event);

            expect(ordersRepository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.CANCELLED);
        });

        it('throws NotFoundException when order does not exist', async () => {
            ordersRepository.updateStatus.mockResolvedValueOnce(null);

            await expect(sut.execute({ orderId: 'non-existent', productId: 'p', quantity: 1, reason: 'test' })).rejects.toThrow(NotFoundException);
        });
    });
});
