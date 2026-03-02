import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReduceStockWhenOrderCreatedUseCase } from '../../../../../application/stock/use-cases/reduce-stock-when-order-created.use-case';
import { StockRepositoryPort } from '../../../../../domain/stock/ports/stock-repository.port';
import { InMemoryStockRepository } from '../../../../../test/doubles/in-memory-stock.repository';
import { Stock } from '../../../../../domain/stock/entities/stock.entities';

describe('ReduceStockWhenOrderCreatedUseCase (integration)', () => {
  let sut: ReduceStockWhenOrderCreatedUseCase;
  let repository: InMemoryStockRepository;

  const stockId = 'stock-1';
  const initialQuantity = 10;

  beforeEach(async () => {
    repository = new InMemoryStockRepository();
    repository.seed(
      new Stock(
        stockId,
        'Product A',
        99.9,
        initialQuantity,
        null,
        new Date(),
      ),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReduceStockWhenOrderCreatedUseCase,
        { provide: StockRepositoryPort, useValue: repository },
      ],
    }).compile();

    sut = module.get(ReduceStockWhenOrderCreatedUseCase);
  });

  describe('execute', () => {
    it('reduces stock quantity and persists', async () => {
      await sut.execute({ id: stockId, quantity: 3 });

      expect(repository.getQuantity(stockId)).toBe(initialQuantity - 3);
    });

    it('throws NotFoundException when stock does not exist', async () => {
      await expect(
        sut.execute({ id: 'non-existent', quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when quantity is not enough', async () => {
      await expect(
        sut.execute({ id: stockId, quantity: initialQuantity + 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
