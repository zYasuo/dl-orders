import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../../../../../product/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../../../../product/domain/ports/product-repository.ports';
import { CreateStockWithProductRelationUseCase } from '../../../../../stock/application/use-cases/create-stock-with-product-relation.use-case';
import { Stock } from '../../../../../stock/domain/entities/stock.entity';
import { IStockRepositoryPort } from '../../../../../stock/domain/ports/stock-repository.port';

describe('CreateStockWithProductRelationUseCase', () => {
    let sut: CreateStockWithProductRelationUseCase;
    let stockRepository: jest.Mocked<IStockRepositoryPort>;
    let productRepository: jest.Mocked<IProductRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProduct = new Product('product-123', 'Product A', 'Desc', 10, createdAt, createdAt);
    const fakeStock = new Stock('stock-123', 'Warehouse 1', 10, 'product-123', createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        productRepository = {
            findById: jest.fn().mockResolvedValue(fakeProduct),
            create: jest.fn(),
            findByName: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<IProductRepositoryPort>;

        stockRepository = {
            create: jest.fn().mockResolvedValue(fakeStock),
            findByProductId: jest.fn().mockResolvedValue(null),
            findByName: jest.fn().mockResolvedValue(null),
            updateQuantity: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IStockRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateStockWithProductRelationUseCase,
                { provide: IStockRepositoryPort, useValue: stockRepository },
                { provide: IProductRepositoryPort, useValue: productRepository },
            ],
        }).compile();

        sut = module.get(CreateStockWithProductRelationUseCase);
    });

    describe('execute', () => {
        it('creates stock and returns it when product exists and no stock for product or name', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };

            const result = await sut.execute(input);

            expect(productRepository.findById).toHaveBeenCalledWith(input.productId);
            expect(stockRepository.findByProductId).toHaveBeenCalledWith(input.productId);
            expect(stockRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(stockRepository.create).toHaveBeenCalledWith({
                productId: input.productId,
                name: input.name,
                quantity: input.quantity,
            });
            expect(result).toEqual(fakeStock);
        });

        it('throws NotFoundException when product does not exist', async () => {
            const input = { productId: 'non-existent', name: 'Warehouse 1', quantity: 10 };
            productRepository.findById.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new NotFoundException('Product not found'));

            expect(stockRepository.findByProductId).not.toHaveBeenCalled();
            expect(stockRepository.create).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when stock already exists for this product', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            stockRepository.findByProductId.mockResolvedValueOnce(fakeStock);

            await expect(sut.execute(input)).rejects.toThrow(new BadRequestException('Stock already exists for this product'));

            expect(stockRepository.findByName).not.toHaveBeenCalled();
            expect(stockRepository.create).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when stock name already exists', async () => {
            const input = { productId: 'product-123', name: 'Existing Warehouse', quantity: 10 };
            stockRepository.findByName.mockResolvedValueOnce(fakeStock);

            await expect(sut.execute(input)).rejects.toThrow(new BadRequestException('A stock with this name already exists'));

            expect(stockRepository.create).not.toHaveBeenCalled();
        });

        it('throws InternalServerErrorException when repository create returns null', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            stockRepository.create.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new InternalServerErrorException('Failed to create stock'));
        });

        it('propagates error when productRepository.findById throws', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            productRepository.findById.mockRejectedValueOnce(new Error('DB error'));

            await expect(sut.execute(input)).rejects.toThrow('DB error');
            expect(stockRepository.create).not.toHaveBeenCalled();
        });

        it('propagates error when stockRepository.create throws', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            stockRepository.create.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');
        });
    });
});
