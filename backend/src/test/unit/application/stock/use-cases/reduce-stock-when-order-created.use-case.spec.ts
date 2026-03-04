import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReduceStockWhenOrderCreatedUseCase } from '../../../../../stock/application/use-cases/reduce-stock-when-order-created.use-case';
import { Stock } from '../../../../../stock/domain/entities/stock.entity';
import { IStockRepositoryPort } from '../../../../../stock/domain/ports/stock-repository.port';

describe('ReduceStockWhenOrderCreatedUseCase', () => {
    let sut: ReduceStockWhenOrderCreatedUseCase;
    let stockRepository: jest.Mocked<IStockRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const productId = 'product-123';
    const stockId = 'stock-123';
    const initialQuantity = 10;
    const fakeStock = new Stock(stockId, 'Warehouse 1', initialQuantity, productId, createdAt, createdAt);
    const reducedStock = new Stock(stockId, 'Warehouse 1', initialQuantity - 3, productId, createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        stockRepository = {
            findByProductId: jest.fn().mockResolvedValue(fakeStock),
            updateQuantity: jest.fn().mockResolvedValue(reducedStock),
            create: jest.fn(),
            findByName: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IStockRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [ReduceStockWhenOrderCreatedUseCase, { provide: IStockRepositoryPort, useValue: stockRepository }],
        }).compile();

        sut = module.get(ReduceStockWhenOrderCreatedUseCase);
    });

    describe('execute', () => {
        it('reduces stock quantity and returns updated stock', async () => {
            const input = { productId, quantity: 3 };

            const result = await sut.execute(input);

            expect(stockRepository.findByProductId).toHaveBeenCalledWith(productId);
            expect(stockRepository.updateQuantity).toHaveBeenCalledWith(stockId, initialQuantity - 3);
            expect(result).toEqual(reducedStock);
        });

        it('throws NotFoundException when stock does not exist for product', async () => {
            const input = { productId: 'non-existent', quantity: 1 };
            stockRepository.findByProductId.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new NotFoundException('Stock not found'));

            expect(stockRepository.updateQuantity).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when stock quantity is not enough', async () => {
            const input = { productId, quantity: initialQuantity + 5 };

            await expect(sut.execute(input)).rejects.toThrow(new BadRequestException('Stock quantity is not enough'));

            expect(stockRepository.updateQuantity).not.toHaveBeenCalled();
        });

        it('reduces to zero when quantity equals current stock', async () => {
            const input = { productId, quantity: initialQuantity };
            const zeroStock = new Stock(stockId, 'Warehouse 1', 0, productId, createdAt, createdAt);
            stockRepository.updateQuantity.mockResolvedValueOnce(zeroStock);

            const result = await sut.execute(input);

            expect(stockRepository.updateQuantity).toHaveBeenCalledWith(stockId, 0);
            expect(result.quantity).toBe(0);
        });

        it('throws InternalServerErrorException when updateQuantity returns null', async () => {
            const input = { productId, quantity: 3 };
            stockRepository.updateQuantity.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new InternalServerErrorException('Failed to update stock'));
        });

        it('propagates error when findByProductId throws', async () => {
            const input = { productId, quantity: 1 };
            stockRepository.findByProductId.mockRejectedValueOnce(new Error('DB error'));

            await expect(sut.execute(input)).rejects.toThrow('DB error');
            expect(stockRepository.updateQuantity).not.toHaveBeenCalled();
        });

        it('propagates error when updateQuantity throws', async () => {
            const input = { productId, quantity: 3 };
            stockRepository.updateQuantity.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');
        });
    });
});
