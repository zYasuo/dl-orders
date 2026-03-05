import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../../../../../product/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../../../../product/domain/ports/product-repository.ports';
import { CreateInventoryWithProductRelationUseCase } from '../../../../../inventory/application/use-cases/create-inventory-with-product-relation.use-case';
import { Inventory } from '../../../../../inventory/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../../../inventory/domain/ports/inventory-repository.port';

describe('CreateInventoryWithProductRelationUseCase', () => {
    let sut: CreateInventoryWithProductRelationUseCase;
    let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;
    let productRepository: jest.Mocked<IProductRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProduct = new Product('product-123', 'Product A', 'Desc', 10, createdAt, createdAt);
    const fakeInventory = new Inventory('inventory-123', 'Warehouse 1', 10, 'product-123', createdAt, createdAt);

    beforeEach(async () => {
        jest.clearAllMocks();

        productRepository = {
            findById: jest.fn().mockResolvedValue(fakeProduct),
            create: jest.fn(),
            findByName: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<IProductRepositoryPort>;

        inventoryRepository = {
            create: jest.fn().mockResolvedValue(fakeInventory),
            findByProductId: jest.fn().mockResolvedValue(null),
            findByName: jest.fn().mockResolvedValue(null),
            updateProductAvailable: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<IInventoryRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInventoryWithProductRelationUseCase,
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
                { provide: IProductRepositoryPort, useValue: productRepository },
            ],
        }).compile();

        sut = module.get(CreateInventoryWithProductRelationUseCase);
    });

    describe('execute', () => {
        it('creates inventory and returns it when product exists and no inventory for product or name', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };

            const result = await sut.execute(input);

            expect(productRepository.findById).toHaveBeenCalledWith(input.productId);
            expect(inventoryRepository.findByProductId).toHaveBeenCalledWith(input.productId);
            expect(inventoryRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(inventoryRepository.create).toHaveBeenCalledWith({
                productId: input.productId,
                name: input.name,
                quantity: input.quantity,
            });
            expect(result).toEqual(fakeInventory);
        });

        it('throws NotFoundException when product does not exist', async () => {
            const input = { productId: 'non-existent', name: 'Warehouse 1', quantity: 10 };
            productRepository.findById.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new NotFoundException('Product not found'));

            expect(inventoryRepository.findByProductId).not.toHaveBeenCalled();
            expect(inventoryRepository.create).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when inventory already exists for this product', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            inventoryRepository.findByProductId.mockResolvedValueOnce(fakeInventory);

            await expect(sut.execute(input)).rejects.toThrow(
                new BadRequestException('Inventory already exists for this product'),
            );

            expect(inventoryRepository.findByName).not.toHaveBeenCalled();
            expect(inventoryRepository.create).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when inventory name already exists', async () => {
            const input = { productId: 'product-123', name: 'Existing Warehouse', quantity: 10 };
            inventoryRepository.findByName.mockResolvedValueOnce(fakeInventory);

            await expect(sut.execute(input)).rejects.toThrow(
                new BadRequestException('An inventory with this name already exists'),
            );

            expect(inventoryRepository.create).not.toHaveBeenCalled();
        });

        it('throws InternalServerErrorException when repository create returns null', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            inventoryRepository.create.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(
                new InternalServerErrorException('Failed to create inventory'),
            );
        });

        it('propagates error when productRepository.findById throws', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            productRepository.findById.mockRejectedValueOnce(new Error('DB error'));

            await expect(sut.execute(input)).rejects.toThrow('DB error');
            expect(inventoryRepository.create).not.toHaveBeenCalled();
        });

        it('propagates error when inventoryRepository.create throws', async () => {
            const input = { productId: 'product-123', name: 'Warehouse 1', quantity: 10 };
            inventoryRepository.create.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');
        });
    });
});
