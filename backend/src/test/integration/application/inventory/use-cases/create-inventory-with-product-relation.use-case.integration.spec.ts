import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IProductRepositoryPort } from '../../../../../product/domain/ports/product-repository.ports';
import { CreateInventoryWithProductRelationUseCase } from '../../../../../inventory/application/use-cases/create-inventory-with-product-relation.use-case';
import { IInventoryRepositoryPort } from '../../../../../inventory/domain/ports/inventory-repository.port';
import { InMemoryProductRepository } from '../../../../doubles/in-memory-product.repository';
import { InMemoryInventoryRepository } from '../../../../doubles/in-memory-inventory.repository';

describe('CreateInventoryWithProductRelationUseCase (integration)', () => {
    let sut: CreateInventoryWithProductRelationUseCase;
    let inventoryRepository: InMemoryInventoryRepository;
    let productRepository: InMemoryProductRepository;
    let productId: string;

    beforeEach(async () => {
        inventoryRepository = new InMemoryInventoryRepository();
        productRepository = new InMemoryProductRepository();
        const created = await productRepository.create({ name: 'Product A', description: 'Description A', price: 99.9 });
        productId = created!.id;

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
        it('creates inventory when product exists', async () => {
            const input = { productId, name: 'Warehouse 1', quantity: 10 };

            const result = await sut.execute(input);

            expect(result.id).toBeDefined();
            expect(result.name).toBe(input.name);
            expect(result.quantity).toBe(input.quantity);
            expect(result.productId).toBe(productId);

            const found = await inventoryRepository.findByName(input.name);
            expect(found).not.toBeNull();
            expect(found!.name).toBe(input.name);
            expect(found!.productId).toBe(productId);
        });

        it('throws NotFoundException when product does not exist', async () => {
            await expect(
                sut.execute({ productId: 'non-existent', name: 'Warehouse 1', quantity: 10 }),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws BadRequestException when inventory already exists for this product', async () => {
            await sut.execute({ productId, name: 'Warehouse 1', quantity: 10 });

            await expect(sut.execute({ productId, name: 'Warehouse 2', quantity: 5 })).rejects.toMatchObject({
                name: 'BadRequestException',
                message: expect.stringContaining('Inventory already exists for this product'),
            });
        });

        it('throws BadRequestException when inventory name already exists', async () => {
            await sut.execute({ productId, name: 'Warehouse 1', quantity: 10 });

            const otherCreated = await productRepository.create({
                name: 'Product B',
                description: 'Description B',
                price: 50,
            });

            await expect(
                sut.execute({ productId: otherCreated!.id, name: 'Warehouse 1', quantity: 5 }),
            ).rejects.toMatchObject({
                name: 'BadRequestException',
                message: expect.stringContaining('An inventory with this name already exists'),
            });
        });
    });
});
