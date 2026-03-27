import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { CreateProductUseCase } from '../../../src/application/use-cases/create-product.use-case';
import { ProductEntity } from '../../../src/domain/entities/product.entity';
import { ProductCachePort } from '../../../src/domain/ports/product-cache.port';
import { ProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';

describe('CreateProductUseCase', () => {
  let sut: CreateProductUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let productCache: jest.Mocked<ProductCachePort>;
  let cache: jest.Mocked<CachePort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const fakeProduct = new ProductEntity(
    'product-123',
    'Product A',
    'Description A',
    99.9,
    null,
    createdAt,
    createdAt,
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    productRepository = {
      create: jest.fn().mockResolvedValue(fakeProduct),
      findById: jest.fn(),
      findByName: jest.fn().mockResolvedValue(null),
      findPage: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ProductRepositoryPort>;

    productCache = {
      getById: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ProductCachePort>;

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn(),
      setJson: jest.fn(),
      incr: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<CachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        { provide: ProductRepositoryPort, useValue: productRepository },
        { provide: ProductCachePort, useValue: productCache },
        { provide: CachePort, useValue: cache },
      ],
    }).compile();

    sut = module.get(CreateProductUseCase);
  });

  describe('execute', () => {
    it('persists product and returns it when name does not exist', async () => {
      const input = { name: 'Product A', description: 'Description A', price: 99.9 };

      const result = await sut.execute(input);

      expect(productRepository.findByName).toHaveBeenCalledWith(input.name);
      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: input.name,
          description: input.description,
          price: input.price,
        }),
      );
      expect(result).toEqual(fakeProduct);
      expect(productCache.invalidate).toHaveBeenCalledWith('product-123');
      expect(cache.incr).toHaveBeenCalledWith('products:all:version');
    });

    it('throws BadRequestException when product name already exists', async () => {
      productRepository.findByName.mockResolvedValueOnce(fakeProduct);

      await expect(
        sut.execute({ name: 'Existing', description: 'Desc', price: 10 }),
      ).rejects.toThrow(new BadRequestException('Product already exists'));
      expect(productRepository.create).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when create returns null', async () => {
      productRepository.create.mockResolvedValueOnce(null);

      await expect(
        sut.execute({ name: 'Product A', description: 'Desc', price: 10 }),
      ).rejects.toThrow(new InternalServerErrorException('Failed to create product'));
    });

    it('propagates error when findByName throws', async () => {
      productRepository.findByName.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        sut.execute({ name: 'Product A', description: 'Desc', price: 10 }),
      ).rejects.toThrow('DB error');
    });

    it('propagates error when create throws', async () => {
      productRepository.create.mockRejectedValueOnce(new Error('DB failed'));

      await expect(
        sut.execute({ name: 'Product A', description: 'Desc', price: 10 }),
      ).rejects.toThrow('DB failed');
    });
  });
});
