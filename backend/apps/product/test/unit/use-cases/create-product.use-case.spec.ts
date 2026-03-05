import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '../../../src/application/use-cases/create-product.use-case';
import { Product } from '../../../src/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';

describe('CreateProductUseCase', () => {
    let sut: CreateProductUseCase;
    let productRepository: jest.Mocked<IProductRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProduct = new Product('product-123', 'Product A', 'Description A', 99.9, createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        productRepository = {
            create: jest.fn().mockResolvedValue(fakeProduct),
            findById: jest.fn(),
            findByName: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
        } as unknown as jest.Mocked<IProductRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [CreateProductUseCase, { provide: IProductRepositoryPort, useValue: productRepository }],
        }).compile();

        sut = module.get(CreateProductUseCase);
    });

    describe('execute', () => {
        it('persists product and returns it when name does not exist', async () => {
            const input = { name: 'Product A', description: 'Description A', price: 99.9 };

            const result = await sut.execute(input);

            expect(productRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(productRepository.create).toHaveBeenCalledWith({
                name: input.name,
                description: input.description,
                price: input.price,
            });
            expect(result).toEqual(fakeProduct);
        });

        it('throws BadRequestException when product name already exists', async () => {
            productRepository.findByName.mockResolvedValueOnce(fakeProduct);

            await expect(sut.execute({ name: 'Existing', description: 'Desc', price: 10 })).rejects.toThrow(
                new BadRequestException('Product already exists'),
            );
            expect(productRepository.create).not.toHaveBeenCalled();
        });

        it('throws InternalServerErrorException when create returns null', async () => {
            productRepository.create.mockResolvedValueOnce(null);

            await expect(sut.execute({ name: 'Product A', description: 'Desc', price: 10 })).rejects.toThrow(
                new InternalServerErrorException('Failed to create product'),
            );
        });

        it('propagates error when findByName throws', async () => {
            productRepository.findByName.mockRejectedValueOnce(new Error('DB error'));

            await expect(sut.execute({ name: 'Product A', description: 'Desc', price: 10 })).rejects.toThrow('DB error');
        });

        it('propagates error when create throws', async () => {
            productRepository.create.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute({ name: 'Product A', description: 'Desc', price: 10 })).rejects.toThrow('DB failed');
        });
    });
});
