import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInventoryUseCase } from '../../../src/application/use-cases/create-inventory.use-case';
import { IInventoryListCachePort } from '../../../src/domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { InMemoryInventoryListCache } from '../../doubles/in-memory-inventory-list-cache';
import { InMemoryInventoryRepository } from '../../doubles/in-memory-inventory.repository';

describe('CreateInventoryUseCase (integration)', () => {
    let sut: CreateInventoryUseCase;
    let inventoryRepository: InMemoryInventoryRepository;
    let listCache: InMemoryInventoryListCache;

    beforeEach(async () => {
        inventoryRepository = new InMemoryInventoryRepository();
        listCache = new InMemoryInventoryListCache();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInventoryUseCase,
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
                { provide: IInventoryListCachePort, useValue: listCache },
            ],
        }).compile();

        sut = module.get(CreateInventoryUseCase);
    });

    describe('execute', () => {
        it('creates inventory when productId and name are unique', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };

            const result = await sut.execute(input);

            expect(result.id).toBeDefined();
            expect(result.name).toBe(input.name);
            expect(result.quantity).toBe(input.quantity);
            expect(result.productId).toBe(input.productId);

            const found = await inventoryRepository.findByName(input.name);
            expect(found).not.toBeNull();
        });

        it('throws BadRequestException when inventory already exists for product', async () => {
            await sut.execute({ productId: 'product-123', name: 'Warehouse 1', quantity: 10 });

            await expect(sut.execute({ productId: 'product-123', name: 'Warehouse 2', quantity: 5 })).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException when inventory name already exists', async () => {
            await sut.execute({ productId: 'product-123', name: 'Warehouse 1', quantity: 10 });

            await expect(sut.execute({ productId: 'product-456', name: 'Warehouse 1', quantity: 5 })).rejects.toThrow(BadRequestException);
        });
    });
});
