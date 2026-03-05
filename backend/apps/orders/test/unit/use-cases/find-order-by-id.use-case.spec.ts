import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindOrderByIdUseCase } from '../../../src/application/use-cases/find-order-by-id.use-case';
import { Order, OrderStatus } from '../../../src/domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('FindOrderByIdUseCase', () => {
    let sut: FindOrderByIdUseCase;
    let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;

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
            create: jest.fn(),
            findById: jest.fn().mockResolvedValue(fakeOrder),
            updateStatus: jest.fn(),
        } as unknown as jest.Mocked<IOrdersRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [FindOrderByIdUseCase, { provide: IOrdersRepositoryPort, useValue: ordersRepository }],
        }).compile();

        sut = module.get(FindOrderByIdUseCase);
    });

    describe('execute', () => {
        it('returns order when found', async () => {
            const result = await sut.execute('id-123');

            expect(ordersRepository.findById).toHaveBeenCalledTimes(1);
            expect(ordersRepository.findById).toHaveBeenCalledWith('id-123');
            expect(result).toEqual(fakeOrder);
        });

        it('throws NotFoundException when order does not exist', async () => {
            ordersRepository.findById.mockResolvedValueOnce(null);

            await expect(sut.execute('non-existent')).rejects.toThrow(new NotFoundException('Order not found'));
        });

        it('propagates error when repository throws', async () => {
            ordersRepository.findById.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute('id-123')).rejects.toThrow('DB failed');
        });
    });
});
