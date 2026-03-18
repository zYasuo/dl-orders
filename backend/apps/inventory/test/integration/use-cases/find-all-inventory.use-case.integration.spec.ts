import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInventoryUseCase } from '../../../src/application/use-cases/find-all-invetory.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { IInventoryListCachePort } from '../../../src/domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { InMemoryInventoryListCache } from '../../doubles/in-memory-inventory-list-cache';
import { InMemoryInventoryRepository } from '../../doubles/in-memory-inventory.repository';

describe('FindAllInventoryUseCase (integration)', () => {
  let sut: FindAllInventoryUseCase;
  let repository: InMemoryInventoryRepository;
  let listCache: InMemoryInventoryListCache;

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
    listCache = new InMemoryInventoryListCache();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInventoryUseCase,
        { provide: IInventoryRepositoryPort, useValue: repository },
        { provide: IInventoryListCachePort, useValue: listCache },
      ],
    }).compile();

    sut = module.get(FindAllInventoryUseCase);
  });

  it('should return all inventory items', async () => {
    const result = await sut.execute();
    expect(result).toHaveLength(2);
    expect(result).toEqual(await repository.findAll());
  });

  it('should return empty array when no inventory items exist', async () => {
    const emptyRepository = new InMemoryInventoryRepository();
    const emptyCache = new InMemoryInventoryListCache();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllInventoryUseCase,
        { provide: IInventoryRepositoryPort, useValue: emptyRepository },
        { provide: IInventoryListCachePort, useValue: emptyCache },
      ],
    }).compile();
    const useCase = module.get(FindAllInventoryUseCase);

    const result = await useCase.execute();
    expect(result).toEqual([]);
  });
});
