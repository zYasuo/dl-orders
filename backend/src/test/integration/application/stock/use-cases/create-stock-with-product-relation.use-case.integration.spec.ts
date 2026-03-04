import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../../../../../product/domain/entrities/product.entity';
import { IProductRepositoryPort } from '../../../../../product/domain/ports/product-repository.ports';
import { CreateStockWithProductRelationUseCase } from '../../../../../stock/application/use-cases/create-stock-with-product-relation.use-case';
import { IStockRepositoryPort } from '../../../../../stock/domain/ports/stock-repository.port';
import { InMemoryProductRepository } from '../../../../doubles/in-memory-product.repository';
import { InMemoryStockRepository } from '../../../../doubles/in-memory-stock.repository';

describe('CreateStockWithProductRelationUseCase (integration)', () => {
    let sut: CreateStockWithProductRelationUseCase;
    let stockRepository: InMemoryStockRepository;
    let productRepository: InMemoryProductRepository;

    const productId = 'product-1';

    beforeEach(async () => {
        stockRepository = new InMemoryStockRepository();
        productRepository = new InMemoryProductRepository();
        const product = new Product(productId, 'Product A', 'Description A', 99.9, new Date(), new Date());
        productRepository.create(product);

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
        it('creates stock when product exists', async () => {
            const input = { productId, name: 'Warehouse 1', quantity: 10 };

            const result = await sut.execute(input);

            expect(result.id).toBeDefined();
            expect(result.name).toBe(input.name);
            expect(result.quantity).toBe(input.quantity);
            expect(result.productId).toBe(productId);

            const found = await stockRepository.findByName(input.name);
            expect(found).not.toBeNull();
            expect(found!.name).toBe(input.name);
            expect(found!.productId).toBe(productId);
        });

        it('throws NotFoundException when product does not exist', async () => {
            await expect(sut.execute({ productId: 'non-existent', name: 'Warehouse 1', quantity: 10 })).rejects.toThrow(NotFoundException);
        });

        it('throws BadRequestException when stock already exists for this product', async () => {
            await sut.execute({ productId, name: 'Warehouse 1', quantity: 10 });

            await expect(sut.execute({ productId, name: 'Warehouse 2', quantity: 5 })).rejects.toThrow(BadRequestException);
            await expect(sut.execute({ productId, name: 'Warehouse 2', quantity: 5 })).rejects.toThrow('Stock already exists for this product');
        });

        it('throws BadRequestException when stock name already exists', async () => {
            await sut.execute({ productId, name: 'Warehouse 1', quantity: 10 });

            const otherProduct = new Product('product-2', 'Product B', 'Description B', 50, new Date(), new Date());
            await productRepository.create(otherProduct);

            await expect(sut.execute({ productId: otherProduct.id, name: 'Warehouse 1', quantity: 5 })).rejects.toThrow(BadRequestException);
            await expect(sut.execute({ productId: otherProduct.id, name: 'Warehouse 1', quantity: 5 })).rejects.toThrow(
                'A stock with this name already exists',
            );
        });
    });
});
