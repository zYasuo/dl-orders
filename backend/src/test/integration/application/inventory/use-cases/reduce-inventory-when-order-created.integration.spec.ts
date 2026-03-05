import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReduceInventoryWhenOrderCreatedUseCase } from '../../../../../inventory/application/use-cases/reduce-inventory-when-order-created.use-case';
import { Inventory } from '../../../../../inventory/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../../../inventory/domain/ports/inventory-repository.port';
import { InMemoryInventoryRepository } from '../../../../doubles/in-memory-inventory.repository';

describe('ReduceInventoryWhenOrderCreatedUseCase (integration)', () => {
    let sut: ReduceInventoryWhenOrderCreatedUseCase;
    let repository: InMemoryInventoryRepository;

    const productId = 'product-1';
    const inventoryId = 'inventory-1';
    const initialQuantity = 10;

    beforeEach(async () => {
        repository = new InMemoryInventoryRepository();
        repository.seed(new Inventory(inventoryId, 'Product A', initialQuantity, productId, new Date(), new Date()));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReduceInventoryWhenOrderCreatedUseCase,
                { provide: IInventoryRepositoryPort, useValue: repository },
            ],
        }).compile();

        sut = module.get(ReduceInventoryWhenOrderCreatedUseCase);
    });

    describe('execute', () => {
        it('reduces inventory quantity and persists', async () => {
            await sut.execute({ productId, quantity: 3 });

            expect(repository.getQuantity(inventoryId)).toBe(initialQuantity - 3);
        });

        it('throws NotFoundException when inventory does not exist', async () => {
            await expect(sut.execute({ productId: 'non-existent-product', quantity: 1 })).rejects.toThrow(
                NotFoundException,
            );
        });

        it('throws BadRequestException when quantity is not enough', async () => {
            await expect(sut.execute({ productId, quantity: initialQuantity + 5 })).rejects.toThrow(BadRequestException);
        });
    });
});
