import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindProductByIdUseCase } from '../../../src/application/use-cases/find-product-by-id.use-case';
import { Product } from '../../../src/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';

describe('FindProductByIdUseCase', () => {
    let sut: FindProductByIdUseCase;
    let productRepository: jest.Mocked<IProductRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProduct = new Product('product-123', 'Product A', 'Description A', 99.9, createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        productRepository = {
            create: jest.fn(),
            findById: jest.fn().mockResolvedValue(fakeProduct),
            findByName: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<IProductRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindProductByIdUseCase,
                { provide: IProductRepositoryPort, useValue: productRepository },
            ],
        }).compile();

        sut = module.get(FindProductByIdUseCase);
    });

    describe('execute', () => {
        it('returns product when found', async () => {
            const result = await sut.execute('product-123');

            expect(productRepository.findById).toHaveBeenCalledTimes(1);
            expect(productRepository.findById).toHaveBeenCalledWith('product-123');
            expect(result).toEqual(fakeProduct);
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
