import { Test, TestingModule } from '@nestjs/testing';
import { CachePort } from '@app/shared';
import { InventoryCacheKeyBuilder } from '../../../src/application/cache/inventory-cache-key-builder';
import { FindAllInventoryUseCase } from '../../../src/application/use-cases/find-all-invetory.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { InventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { InMemoryInventoryRepository } from '../../doubles/in-memory-inventory.repository';

jest.mock('@app/shared', () => ({
  CachePort: class CachePort {},
  runWithCacheReadLock: async <T>(
    _cache: unknown,
    _cacheKey: string,
    onLockAcquired: () => Promise<T>,
  ): Promise<T> => onLockAcquired(),
}));

describe('FindAllInventoryUseCase (integration)', () => {
  let sut: FindAllInventoryUseCase;
  let repository: InMemoryInventoryRepository;
  let cache: jest.Mocked<CachePort>;

  const now = new Date();

  const item1 = new InventoryEntity(
    'inventory-123',
    'Inventory 1',
    10,
    100,
    1,
    5,
    'product-123',
    'test@example.com',
    now,
    now,
  );

  const item2 = new InventoryEntity(
    'inventory-456',
    'Inventory 2',
    20,
    100,
    1,
    5,
    'product-456',
    'test@example.com',
    now,
    now,
  );

  beforeEach(async () => {
    repository = new InMemoryInventoryRepository();
    repository.seed(item1);
    repository.seed(item2);

    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      setIfNotExists: jest.fn(),
      del: jest.fn(),
      delIfEquals: jest.fn(),
      exists: jest.fn(),
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn(),
    } as unknown as jest.Mocked<CachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInventoryUseCase,
        { provide: InventoryRepositoryPort, useValue: repository },
        { provide: CachePort, useValue: cache },
        InventoryCacheKeyBuilder,
      ],
    }).compile();

    sut = module.get(FindAllInventoryUseCase);
  });

  it('should return paginated inventory items', async () => {
    const result = await sut.execute({ page: 1, limit: 12 });

    expect(result.data).toHaveLength(2);
    expect(result.meta).toMatchObject({ page: 1, limit: 12, total: 2, totalPages: 1 });
    expect(cache.setJson).toHaveBeenCalled();
  });

  it('should return empty data when no inventory items exist', async () => {
    const emptyRepository = new InMemoryInventoryRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInventoryUseCase,
        { provide: InventoryRepositoryPort, useValue: emptyRepository },
        { provide: CachePort, useValue: cache },
        InventoryCacheKeyBuilder,
      ],
    }).compile();
    const useCase = module.get(FindAllInventoryUseCase);

    const result = await useCase.execute({ page: 1, limit: 12 });

    expect(result.data).toEqual([]);
    expect(result.meta).toMatchObject({ page: 1, limit: 12, total: 0, totalPages: 0 });
  });
});
