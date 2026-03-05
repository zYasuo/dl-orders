import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindOrderByIdUseCase } from '../../../src/application/use-cases/find-order-by-id.use-case';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';
import { InMemoryOrdersRepository } from '../../doubles/in-memory-orders.repository';

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
            const created = await ordersRepository.create({ productId: '123', quantity: 1, description: 'order 1', recipient: 'test@test.com' });

            const result = await sut.execute(created!.id);
            expect(result.id).toBe(created!.id);
            expect(result.productId).toBe(created!.productId);
        });

        it('throws NotFoundException when order does not exist', async () => {
            await expect(sut.execute('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });
});
