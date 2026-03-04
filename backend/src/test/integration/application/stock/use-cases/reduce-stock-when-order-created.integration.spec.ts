import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReduceStockWhenOrderCreatedUseCase } from '../../../../../stock/application/use-cases/reduce-stock-when-order-created.use-case';
import { Stock } from '../../../../../stock/domain/entities/stock.entity';
import { IStockRepositoryPort } from '../../../../../stock/domain/ports/stock-repository.port';
import { InMemoryStockRepository } from '../../../../doubles/in-memory-stock.repository';

describe('ReduceStockWhenOrderCreatedUseCase (integration)', () => {
    let sut: ReduceStockWhenOrderCreatedUseCase;
    let repository: InMemoryStockRepository;

    const productId = 'product-1';
    const stockId = 'stock-1';
    const initialQuantity = 10;

    beforeEach(async () => {
        repository = new InMemoryStockRepository();
        repository.seed(new Stock(stockId, 'Product A', initialQuantity, productId, new Date(), new Date()));

        const module: TestingModule = await Test.createTestingModule({
            providers: [ReduceStockWhenOrderCreatedUseCase, { provide: IStockRepositoryPort, useValue: repository }],
        }).compile();

        sut = module.get(ReduceStockWhenOrderCreatedUseCase);
    });

    describe('execute', () => {
        it('reduces stock quantity and persists', async () => {
            await sut.execute({ productId, quantity: 3 });

            expect(repository.getQuantity(stockId)).toBe(initialQuantity - 3);
        });

        it('throws NotFoundException when stock does not exist', async () => {
            await expect(sut.execute({ productId: 'non-existent-product', quantity: 1 })).rejects.toThrow(NotFoundException);
        });

        it('throws BadRequestException when quantity is not enough', async () => {
            await expect(sut.execute({ productId, quantity: initialQuantity + 5 })).rejects.toThrow(BadRequestException);
        });
    });
});
