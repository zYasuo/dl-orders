import { Test, TestingModule } from '@nestjs/testing';
import { FindAllInventoryUseCase } from '../../../src/application/use-cases/find-all-invetory.use-case';
import { Inventory } from '../../../src/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';
import { InMemoryInventoryRepository } from '../../doubles/in-memory-inventory.repository';

describe('FindAllInventoryUseCase (integration)', () => {
    let sut: FindAllInventoryUseCase;
    let repository: InMemoryInventoryRepository;

    const item1 = new Inventory('inventory-123', 'Inventory 1', 10, 'product-123', new Date(), new Date());
    const item2 = new Inventory('inventory-456', 'Inventory 2', 20, 'product-456', new Date(), new Date());

    beforeEach(async () => {
        repository = new InMemoryInventoryRepository();
        repository.seed(item1);
        repository.seed(item2);

        const module: TestingModule = await Test.createTestingModule({
            providers: [FindAllInventoryUseCase, { provide: IInventoryRepositoryPort, useValue: repository }],
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
        const module: TestingModule = await Test.createTestingModule({
            providers: [FindAllInventoryUseCase, { provide: IInventoryRepositoryPort, useValue: emptyRepository }],
        }).compile();
        const useCase = module.get(FindAllInventoryUseCase);

        const result = await useCase.execute();
        expect(result).toEqual([]);
    });
});
