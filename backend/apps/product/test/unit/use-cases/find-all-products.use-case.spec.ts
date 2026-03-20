import { Test, TestingModule } from '@nestjs/testing';
import { FindAllProductsUseCase } from '../../../src/application/use-cases/find-all-products.use-case';
import { ProductEntity } from '../../../src/domain/entities/product.entity';
import { ProductCachePort } from '../../../src/domain/ports/product-cache.port';
import { ProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';

describe('FindAllProductsUseCase', () => {
  let sut: FindAllProductsUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let productCache: jest.Mocked<ProductCachePort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const fakeProducts = [
    new ProductEntity('id-1', 'Product A', 'Description A', 99.9, null, createdAt, createdAt),
    new ProductEntity('id-2', 'Product B', 'Description B', 49.9, null, createdAt, createdAt),
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    productRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn().mockResolvedValue(fakeProducts),
      update: jest.fn(),
    } as unknown as jest.Mocked<ProductRepositoryPort>;

    productCache = {
      getById: jest.fn(),
      getAll: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      setAll: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn(),
    } as unknown as jest.Mocked<ProductCachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllProductsUseCase,
        { provide: ProductRepositoryPort, useValue: productRepository },
        { provide: ProductCachePort, useValue: productCache },
      ],
    }).compile();

    sut = module.get(FindAllProductsUseCase);
  });

  describe('execute', () => {
    it('returns products from repository when cache miss', async () => {
      const result = await sut.execute();

      expect(productCache.getAll).toHaveBeenCalled();
      expect(productRepository.findAll).toHaveBeenCalled();
      expect(productCache.setAll).toHaveBeenCalledWith(fakeProducts, 300);
      expect(result).toEqual(fakeProducts);
    });

    it('returns cached products when cache hit', async () => {
      productCache.getAll.mockResolvedValueOnce(fakeProducts);

      const result = await sut.execute();

      expect(result).toEqual(fakeProducts);
      expect(productRepository.findAll).not.toHaveBeenCalled();
      expect(productCache.setAll).not.toHaveBeenCalled();
    });

    it('returns null when repository returns null and does not set cache', async () => {
      productRepository.findAll.mockResolvedValueOnce(null);

      const result = await sut.execute();

      expect(result).toBeNull();
      expect(productCache.setAll).not.toHaveBeenCalled();
    });

    it('returns empty array from repository and sets cache', async () => {
      productRepository.findAll.mockResolvedValueOnce([]);

      const result = await sut.execute();

      expect(result).toEqual([]);
      expect(productCache.setAll).toHaveBeenCalledWith([], 300);
    });

    it('propagates error when repository throws', async () => {
      productRepository.findAll.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute()).rejects.toThrow('DB failed');
    });

    it('propagates error when cache throws', async () => {
      productCache.getAll.mockRejectedValueOnce(new Error('Redis down'));

      await expect(sut.execute()).rejects.toThrow('Redis down');
    });
  });
});
