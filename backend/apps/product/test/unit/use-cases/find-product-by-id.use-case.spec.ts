import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindProductByIdUseCase } from '../../../src/application/use-cases/find-product-by-id.use-case';
import { ProductEntity } from '../../../src/domain/entities/product.entity';
import { IProductCachePort } from '../../../src/domain/ports/product-cache.port';
import { IProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';

describe('FindProductByIdUseCase', () => {
    let sut: FindProductByIdUseCase;
    let productRepository: jest.Mocked<IProductRepositoryPort>;
    let productCache: jest.Mocked<IProductCachePort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProduct = new ProductEntity('product-123', 'Product A', 'Description A', 99.9, null, createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        productRepository = {
            create: jest.fn(),
            findById: jest.fn().mockResolvedValue(fakeProduct),
            findByName: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<IProductRepositoryPort>;

        productCache = {
            getById: jest.fn().mockResolvedValue(null),
            getAll: jest.fn(),
            set: jest.fn().mockResolvedValue(undefined),
            setAll: jest.fn(),
            invalidate: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IProductCachePort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindProductByIdUseCase,
                { provide: IProductRepositoryPort, useValue: productRepository },
                { provide: IProductCachePort, useValue: productCache },
            ],
        }).compile();

        sut = module.get(FindProductByIdUseCase);
    });

    describe('execute', () => {
        it('returns product when found', async () => {
            const result = await sut.execute('product-123');

            expect(productCache.getById).toHaveBeenCalledWith('product-123');
            expect(productRepository.findById).toHaveBeenCalledWith('product-123');
            expect(productCache.set).toHaveBeenCalledWith(fakeProduct, 300);
            expect(result).toEqual(fakeProduct);
        });

        it('returns cached product when cache hit', async () => {
            productCache.getById.mockResolvedValueOnce(fakeProduct);
            const result = await sut.execute('product-123');
            expect(result).toEqual(fakeProduct);
            expect(productRepository.findById).not.toHaveBeenCalled();
        });

        it('throws NotFoundException when product does not exist', async () => {
            productRepository.findById.mockResolvedValueOnce(null);

            await expect(sut.execute('non-existent')).rejects.toThrow(
                new NotFoundException('Product non-existent not found'),
            );
        });

        it('propagates error when repository throws', async () => {
            productRepository.findById.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute('product-123')).rejects.toThrow('DB failed');
        });
    });
});
