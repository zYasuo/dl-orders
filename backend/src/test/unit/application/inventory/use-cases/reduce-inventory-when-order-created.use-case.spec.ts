import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReduceInventoryWhenOrderCreatedUseCase } from '../../../../../inventory/application/use-cases/reduce-inventory-when-order-created.use-case';
import { Inventory } from '../../../../../inventory/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../../../inventory/domain/ports/inventory-repository.port';

describe('ReduceInventoryWhenOrderCreatedUseCase', () => {
    let sut: ReduceInventoryWhenOrderCreatedUseCase;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const productId = 'product-123';
    const inventoryId = 'inventory-123';
    const initialQuantity = 10;
    const fakeInventory = new Inventory(inventoryId, 'Warehouse 1', initialQuantity, productId, createdAt, createdAt);
    const reducedInventory = new Inventory(
        inventoryId,
        'Warehouse 1',
        initialQuantity - 3,
        productId,
        createdAt,
        createdAt,
    );

    beforeEach(async () => {
        jest.clearAllMocks();

        inventoryRepository = {
            findByProductId: jest.fn().mockResolvedValue(fakeInventory),
            updateProductAvailable: jest.fn().mockResolvedValue(reducedInventory),
            create: jest.fn(),
            findByName: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IInventoryRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReduceInventoryWhenOrderCreatedUseCase,
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
            ],
        }).compile();

        sut = module.get(ReduceInventoryWhenOrderCreatedUseCase);
    });

    describe('execute', () => {
        it('reduces inventory quantity and returns updated inventory', async () => {
            const input = { productId, quantity: 3 };

            const result = await sut.execute(input);

            expect(inventoryRepository.findByProductId).toHaveBeenCalledWith(productId);
            expect(inventoryRepository.updateProductAvailable).toHaveBeenCalledWith(inventoryId, initialQuantity - 3);
            expect(result).toEqual(reducedInventory);
        });

        it('throws NotFoundException when inventory does not exist for product', async () => {
            const input = { productId: 'non-existent', quantity: 1 };
            inventoryRepository.findByProductId.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new NotFoundException('Inventory not found'));

            expect(inventoryRepository.updateProductAvailable).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when inventory quantity is not enough', async () => {
            const input = { productId, quantity: initialQuantity + 5 };

            await expect(sut.execute(input)).rejects.toThrow(
                new BadRequestException('Inventory quantity is not enough'),
            );

            expect(inventoryRepository.updateProductAvailable).not.toHaveBeenCalled();
        });

        it('reduces to zero when quantity equals current inventory', async () => {
            const input = { productId, quantity: initialQuantity };
            const zeroInventory = new Inventory(inventoryId, 'Warehouse 1', 0, productId, createdAt, createdAt);
            inventoryRepository.updateProductAvailable.mockResolvedValueOnce(zeroInventory);

            const result = await sut.execute(input);

            expect(inventoryRepository.updateProductAvailable).toHaveBeenCalledWith(inventoryId, 0);
            expect(result.quantity).toBe(0);
        });

        it('throws InternalServerErrorException when updateProductAvailable returns null', async () => {
            const input = { productId, quantity: 3 };
            inventoryRepository.updateProductAvailable.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(
                new InternalServerErrorException('Failed to update product available'),
            );
        });

        it('propagates error when findByProductId throws', async () => {
            const input = { productId, quantity: 1 };
            inventoryRepository.findByProductId.mockRejectedValueOnce(new Error('DB error'));

            await expect(sut.execute(input)).rejects.toThrow('DB error');
            expect(inventoryRepository.updateProductAvailable).not.toHaveBeenCalled();
        });

        it('propagates error when updateProductAvailable throws', async () => {
            const input = { productId, quantity: 3 };
            inventoryRepository.updateProductAvailable.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');
        });
    });
});
