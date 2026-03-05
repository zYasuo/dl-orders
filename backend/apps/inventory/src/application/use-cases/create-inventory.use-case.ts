import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Inventory } from '../../domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { ICreateInventory } from '../../domain/types/inventory-repository.types';
import { TCreateInventory } from '../dto/create-inventory.schema';

@Injectable()
export class CreateInventoryUseCase {
    constructor(private readonly inventoryRepositoryPort: IInventoryRepositoryPort) {}

    async execute(input: TCreateInventory): Promise<Inventory> {
        const { productId, name, quantity } = input;

        const existingInventory = await this.inventoryRepositoryPort.findByProductId(productId);

        if (existingInventory) {
            throw new BadRequestException('Inventory already exists for this product');
        }

        const existingByName = await this.inventoryRepositoryPort.findByName(name);
        if (existingByName) {
            throw new BadRequestException('An inventory with this name already exists');
        }

        const createInput: ICreateInventory = { productId, name, quantity };
        const created = await this.inventoryRepositoryPort.create(createInput);

        if (!created) {
            throw new InternalServerErrorException('Failed to create inventory');
        }

        return created;
    }
}
