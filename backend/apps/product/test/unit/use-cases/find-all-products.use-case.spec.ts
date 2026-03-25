import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { FindAllProductsUseCase } from '../../../src/application/use-cases/find-all-products.use-case';
import { ProductCacheKeyBuilder } from '../../../src/application/cache/product-cache-key-builder';
import { ProductEntity } from '../../../src/domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';

jest.mock('@app/shared', () => ({
  CachePort: class CachePort {},
  runWithCacheReadLock: async <T>(
    _cache: unknown,
    _cacheKey: string,
    onLockAcquired: () => Promise<T>,
  ): Promise<T> => onLockAcquired(),
}));

describe('FindAllProductsUseCase', () => {
  let sut: FindAllProductsUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let cache: jest.Mocked<CachePort>;
  let cacheKeyBuilder: jest.Mocked<ProductCacheKeyBuilder>;

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
      findPage: jest.fn().mockResolvedValue(fakeProducts),
      count: jest.fn().mockResolvedValue(2),
      update: jest.fn(),
    } as unknown as jest.Mocked<ProductRepositoryPort>;

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn(),
    } as unknown as jest.Mocked<CachePort>;

    cacheKeyBuilder = {
      buildListKey: jest.fn().mockResolvedValue('products:all:v1:page:1:limit:12'),
      bumpVersion: jest.fn(),
    } as unknown as jest.Mocked<ProductCacheKeyBuilder>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllProductsUseCase,
        { provide: ProductRepositoryPort, useValue: productRepository },
        { provide: CachePort, useValue: cache },
        { provide: ProductCacheKeyBuilder, useValue: cacheKeyBuilder },
      ],
    }).compile();

    sut = module.get(FindAllProductsUseCase);
  });

  describe('execute', () => {
    it('returns paginated products from repository', async () => {
      const result = await sut.execute(1, 12);

      expect(productRepository.findPage).toHaveBeenCalledWith(1, 12);
      expect(productRepository.count).toHaveBeenCalled();
      expect(cacheKeyBuilder.buildListKey).toHaveBeenCalledWith(1, 12);
      expect(result).toEqual({
        data: fakeProducts,
        meta: { page: 1, limit: 12, total: 2, totalPages: 1 },
      });
    });

    it('computes totalPages from total and limit', async () => {
      productRepository.findPage.mockResolvedValueOnce([fakeProducts[0]!]);
      productRepository.count.mockResolvedValueOnce(25);

      const result = await sut.execute(2, 10);

      expect(result.meta).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
    });

    it('returns empty data when page has no items', async () => {
      productRepository.findPage.mockResolvedValueOnce([]);
      productRepository.count.mockResolvedValueOnce(5);

      const result = await sut.execute(99, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(1);
    });

    it('returns totalPages 0 when total is 0', async () => {
      productRepository.findPage.mockResolvedValueOnce([]);
      productRepository.count.mockResolvedValueOnce(0);

      const result = await sut.execute(1, 12);

      expect(result.meta.totalPages).toBe(0);
    });

    it('propagates error when repository throws', async () => {
      productRepository.findPage.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute(1, 12)).rejects.toThrow('DB failed');
    });

    it('returns cached page when cache hit', async () => {
      const cached = {
        data: fakeProducts,
        meta: { page: 1, limit: 12, total: 2, totalPages: 1 },
      };
      cache.getJson.mockResolvedValueOnce(cached);

      const result = await sut.execute(1, 12);

      expect(result).toEqual(cached);
      expect(productRepository.findPage).not.toHaveBeenCalled();
      expect(productRepository.count).not.toHaveBeenCalled();
    });
  });
});
