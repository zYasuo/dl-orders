import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInventoryUseCase } from '../../../src/application/use-cases/find-all-invetory.use-case';
import { Inventory } from '../../../src/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';

describe('FindAllInventoryUseCase', () => {
    const fakeInventoryItems = [
        new Inventory('inventory-123', 'Inventory 1', 10, 'product-123', new Date(), new Date()),
        new Inventory('inventory-456', 'Inventory 2', 20, 'product-456', new Date(), new Date()),
    ];

    let sut: FindAllInventoryUseCase;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;

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

        const module: TestingModule = await Test.createTestingModule({
            providers: [FindAllInventoryUseCase, { provide: IInventoryRepositoryPort, useValue: inventoryRepository }],
        }).compile();

        sut = module.get(FindAllInventoryUseCase);
    });

    it('should return all inventory items', async () => {
        const result = await sut.execute();
        expect(result).toEqual(fakeInventoryItems);
        expect(inventoryRepository.findAll).toHaveBeenCalledTimes(1);
    });
    
    it('should return empty array when no inventory items exist', async () => {
        inventoryRepository.findAll.mockResolvedValueOnce([]);
        const result = await sut.execute();
        expect(result).toEqual([]);
        expect(inventoryRepository.findAll).toHaveBeenCalledTimes(1);
    });
});
