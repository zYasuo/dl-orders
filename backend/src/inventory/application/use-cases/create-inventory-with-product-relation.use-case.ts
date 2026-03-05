import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Inventory } from 'src/inventory/domain/entities/inventory.entity';
import { IProductRepositoryPort } from '../../../product/domain/ports/product-repository.ports';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { ICreateInventory } from '../../domain/types/inventory-repository.types';
import { TCreateInventoryWithProductRelation } from '../dto/create-inventory-with-product-relation.schema';

@Injectable()
export class CreateInventoryWithProductRelationUseCase {
    constructor(
        private readonly inventoryRepositoryPort: IInventoryRepositoryPort,
        private readonly productRepositoryPort: IProductRepositoryPort,
    ) {}

    async execute(input: TCreateInventoryWithProductRelation): Promise<Inventory> {
        const { productId, name, quantity } = input;
        const product = await this.productRepositoryPort.findById(productId);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const existingInventory = await this.inventoryRepositoryPort.findByProductId(productId);

        if (existingInventory) {
            throw new BadRequestException('Inventory already exists for this product');
        }

        const existingInventoryByName = await this.inventoryRepositoryPort.findByName(name);

        if (existingInventoryByName) {
            throw new BadRequestException('An inventory with this name already exists');
        }

        const createInput: ICreateInventory = {
            productId,
            name,
            quantity,
        };
        const createdInventory = await this.inventoryRepositoryPort.create(createInput);

        if (!createdInventory) {
            throw new InternalServerErrorException('Failed to create inventory');
        }

        return createdInventory;
    }
}
