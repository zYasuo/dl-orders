import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { InventoryCacheKeyBuilder } from '../../../src/application/cache/inventory-cache-key-builder';
import { FindAllInventoryUseCase } from '../../../src/application/use-cases/find-all-invetory.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { InventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';

jest.mock('@app/shared', () => ({
  CachePort: class CachePort {},
  runWithCacheReadLock: async <T>(
    _cache: unknown,
    _cacheKey: string,
    onLockAcquired: () => Promise<T>,
  ): Promise<T> => onLockAcquired(),
}));

describe('FindAllInventoryUseCase', () => {
  const now = new Date();
  const createdBy = 'creator@test.com';

  const fakeInventoryItems = [
    new InventoryEntity(
      'inventory-123',
      'Inventory 1',
      10,
      100,
      1,
      5,
      'product-123',
      createdBy,
      now,
      now,
    ),
    new InventoryEntity(
      'inventory-456',
      'Inventory 2',
      20,
      100,
      1,
      5,
      'product-456',
      createdBy,
      now,
      now,
    ),
  ];

  let sut: FindAllInventoryUseCase;
  let inventoryRepository: jest.Mocked<InventoryRepositoryPort>;
  let cache: jest.Mocked<CachePort>;
  let cacheKeyBuilder: jest.Mocked<InventoryCacheKeyBuilder>;

  beforeEach(async () => {
    jest.clearAllMocks();

    inventoryRepository = {
      findAll: jest.fn(),
      findPage: jest.fn().mockResolvedValue(fakeInventoryItems),
      count: jest.fn().mockResolvedValue(2),
      create: jest.fn(),
      findByProductId: jest.fn(),
      findByName: jest.fn(),
      findLowStock: jest.fn(),
      findLowStockPage: jest.fn(),
      decrementStock: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepositoryPort>;

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
      buildListKey: jest.fn().mockResolvedValue('inventories:all:v1:page:1:limit:12'),
      bumpVersion: jest.fn(),
    } as unknown as jest.Mocked<InventoryCacheKeyBuilder>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInventoryUseCase,
        { provide: InventoryRepositoryPort, useValue: inventoryRepository },
        { provide: CachePort, useValue: cache },
        { provide: InventoryCacheKeyBuilder, useValue: cacheKeyBuilder },
      ],
    }).compile();

    sut = module.get(FindAllInventoryUseCase);
  });

  it('should return all inventory items', async () => {
    const result = await sut.execute({ page: 1, limit: 12 });
    expect(result).toEqual({
      data: fakeInventoryItems,
      meta: { page: 1, limit: 12, total: 2, totalPages: 1 },
    });
    expect(cache.getJson).toHaveBeenCalledTimes(1);
    expect(inventoryRepository.findPage).toHaveBeenCalledWith(1, 12);
    expect(inventoryRepository.count).toHaveBeenCalledTimes(1);
    expect(cache.setJson).toHaveBeenCalled();
  });

  it('should return cached list when cache hit', async () => {
    const cached = {
      data: fakeInventoryItems,
      meta: { page: 1, limit: 12, total: 2, totalPages: 1 },
    };
    cache.getJson.mockResolvedValueOnce(cached);
    const result = await sut.execute({ page: 1, limit: 12 });
    expect(result).toEqual(cached);
    expect(inventoryRepository.findPage).not.toHaveBeenCalled();
    expect(cache.setJson).not.toHaveBeenCalled();
  });

  it('should return empty array when no inventory items exist', async () => {
    inventoryRepository.findPage.mockResolvedValueOnce([]);
    inventoryRepository.count.mockResolvedValueOnce(0);
    const result = await sut.execute({ page: 1, limit: 12 });
    expect(result).toEqual({
      data: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });
    expect(inventoryRepository.findPage).toHaveBeenCalledTimes(1);
  });
});
