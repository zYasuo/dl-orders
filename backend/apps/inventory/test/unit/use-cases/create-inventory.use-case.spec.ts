import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInventoryUseCase } from '../../../src/application/use-cases/create-inventory.use-case';
import { Inventory } from '../../../src/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';

describe('CreateInventoryUseCase', () => {
    let sut: CreateInventoryUseCase;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeInventory = new Inventory('inventory-123', 'Warehouse 1', 10, 'product-123', createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        inventoryRepository = {
            create: jest.fn().mockResolvedValue(fakeInventory),
            findByProductId: jest.fn().mockResolvedValue(null),
            findByName: jest.fn().mockResolvedValue(null),
            updateProductAvailable: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IInventoryRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInventoryUseCase,
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
            ],
        }).compile();

        sut = module.get(CreateInventoryUseCase);
    });

    describe('execute', () => {
        it('creates inventory and returns it', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };

            const result = await sut.execute(input);

            expect(inventoryRepository.findByProductId).toHaveBeenCalledWith(input.productId);
            expect(inventoryRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(inventoryRepository.create).toHaveBeenCalledWith({
                productId: input.productId,
                name: input.name,
                quantity: input.quantity,
            });
            expect(result).toEqual(fakeInventory);
        });

        it('throws BadRequestException when inventory already exists for product', async () => {
            inventoryRepository.findByProductId.mockResolvedValueOnce(fakeInventory);

            await expect(sut.execute({ productId: 'product-123', name: 'W', quantity: 10 })).rejects.toThrow(
                new BadRequestException('Inventory already exists for this product'),
            );
            expect(inventoryRepository.create).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when inventory name already exists', async () => {
            inventoryRepository.findByName.mockResolvedValueOnce(fakeInventory);

            await expect(sut.execute({ productId: 'product-123', name: 'Existing', quantity: 10 })).rejects.toThrow(
                new BadRequestException('An inventory with this name already exists'),
            );
            expect(inventoryRepository.create).not.toHaveBeenCalled();
        });

        it('throws InternalServerErrorException when create returns null', async () => {
            inventoryRepository.create.mockResolvedValueOnce(null);

            await expect(sut.execute({ productId: 'product-123', name: 'W', quantity: 10 })).rejects.toThrow(
                new InternalServerErrorException('Failed to create inventory'),
            );
        });
    });
});
