import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindOrderByIdUseCase } from '../../../../../orders/application/use-cases/find-order-by-id.use-case';
import { IOrdersRepositoryPort } from '../../../../../orders/domain/ports/orders-repository.port';
import { InMemoryOrdersRepository } from '../../../../doubles/in-memory-orders.repository';

describe('FindOrderByIdUseCase (integration)', () => {
    let sut: FindOrderByIdUseCase;
    let ordersRepository: InMemoryOrdersRepository;

    beforeEach(async () => {
        ordersRepository = new InMemoryOrdersRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [FindOrderByIdUseCase, { provide: IOrdersRepositoryPort, useValue: ordersRepository }],
        }).compile();

        sut = module.get(FindOrderByIdUseCase);
    });

    describe('execute', () => {
        it('returns order when found', async () => {
            const created1 = await ordersRepository.create({ description: 'order 1' });
            const created2 = await ordersRepository.create({ description: 'order 2' });

            const result1 = await sut.execute(created1.id);
            expect(result1.id).toBe(created1.id);
            expect(result1.description).toBe('order 1');

            const result2 = await sut.execute(created2.id);
            expect(result2.id).toBe(created2.id);
            expect(result2.description).toBe('order 2');
        });

        it('throws NotFoundException when order does not exist', async () => {
            await expect(sut.execute('non-existent-id')).rejects.toThrow(NotFoundException);
            await expect(sut.execute('non-existent-id')).rejects.toThrow('Order not found');
        });
    });
});
