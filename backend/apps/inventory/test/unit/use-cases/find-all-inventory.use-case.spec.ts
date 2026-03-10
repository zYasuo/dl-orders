import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInventoryUseCase } from '../../../src/application/use-cases/find-all-invetory.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { IInventoryListCachePort } from '../../../src/domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';

describe('FindAllInventoryUseCase', () => {
    const fakeInventoryItems = [
        new InventoryEntity('inventory-123', 'Inventory 1', 10, 'product-123', new Date(), new Date()),
        new InventoryEntity('inventory-456', 'Inventory 2', 20, 'product-456', new Date(), new Date()),
    ];

    let sut: FindAllInventoryUseCase;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;
    let listCache: jest.Mocked<IInventoryListCachePort>;

    beforeEach(async () => {
        jest.clearAllMocks();

        inventoryRepository = {
            findAll: jest.fn().mockResolvedValue(fakeInventoryItems),
            create: jest.fn(),
            findByProductId: jest.fn(),
            findByName: jest.fn(),
            decrementStock: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IInventoryRepositoryPort>;

        listCache = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            invalidate: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IInventoryListCachePort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindAllInventoryUseCase,
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
                { provide: IInventoryListCachePort, useValue: listCache },
            ],
        }).compile();

        sut = module.get(FindAllInventoryUseCase);
    });

    it('should return all inventory items', async () => {
        const result = await sut.execute();
        expect(result).toEqual(fakeInventoryItems);
        expect(listCache.get).toHaveBeenCalledTimes(1);
        expect(inventoryRepository.findAll).toHaveBeenCalledTimes(1);
        expect(listCache.set).toHaveBeenCalledWith(fakeInventoryItems, 60);
    });

    it('should return cached list when cache hit', async () => {
        listCache.get.mockResolvedValueOnce(fakeInventoryItems);
        const result = await sut.execute();
        expect(result).toEqual(fakeInventoryItems);
        expect(inventoryRepository.findAll).not.toHaveBeenCalled();
        expect(listCache.set).not.toHaveBeenCalled();
    });

    it('should return empty array when no inventory items exist', async () => {
        inventoryRepository.findAll.mockResolvedValueOnce([]);
        const result = await sut.execute();
        expect(result).toEqual([]);
        expect(inventoryRepository.findAll).toHaveBeenCalledTimes(1);
    });
});
