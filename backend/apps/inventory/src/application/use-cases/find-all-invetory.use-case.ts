import { BadRequestException, Injectable } from '@nestjs/common';
import { Inventory } from '../../domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';

@Injectable()
export class FindAllInventoryUseCase {
    constructor(private readonly inventoryRepositoryPort: IInventoryRepositoryPort) {}

    async execute(): Promise<Inventory[]> {
        const inventoryItems = await this.inventoryRepositoryPort.findAll();

        if (inventoryItems.length === 0) {
            throw new BadRequestException('Inventory items not found');
        }

        return inventoryItems;
    }
}
