import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import { IInventoryListCachePort } from '../../domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { ICreateInventory } from '../../domain/types/inventory-repository.types';
import { TCreateInventory } from '../dto/create-inventory.schema';

@Injectable()
export class CreateInventoryUseCase {
    constructor(
        private readonly inventoryRepositoryPort: IInventoryRepositoryPort,
        private readonly listCache: IInventoryListCachePort,
    ) {}

    async execute(input: TCreateInventory): Promise<InventoryEntity> {
        const { productId, name, quantity } = input;

        const [existingInventory, existingByName] = await Promise.all([
            this.inventoryRepositoryPort.findByProductId(productId),
            this.inventoryRepositoryPort.findByName(name),
        ]);

        if (existingInventory) {
            throw new BadRequestException('Inventory already exists for this product');
        }
        
        if (existingByName) {
            throw new BadRequestException('An inventory with this name already exists');
        }

        const createInput: ICreateInventory = { productId, name, quantity };
        const created = await this.inventoryRepositoryPort.create(createInput);

        if (!created) {
            throw new InternalServerErrorException('Failed to create inventory');
        }

        await this.listCache.invalidate();
        return created;
    }
}
