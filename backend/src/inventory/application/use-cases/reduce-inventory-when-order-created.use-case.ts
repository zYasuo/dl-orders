import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Inventory } from 'src/inventory/domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { TReduceInventory } from '../dto/reduce-inventory-when-order-created.dto';

@Injectable()
export class ReduceInventoryWhenOrderCreatedUseCase {
    constructor(private readonly inventoryRepositoryPort: IInventoryRepositoryPort) {}

    async execute(input: TReduceInventory): Promise<Inventory> {
        const { productId, quantity } = input;

        const productAvailable = await this.inventoryRepositoryPort.findByProductId(productId);

        if (!productAvailable) {
            throw new NotFoundException('Inventory not found');
        }

        const newQuantity = productAvailable.quantity - quantity;

        if (newQuantity < 0) {
            throw new BadRequestException('Inventory quantity is not enough');
        }

        const updatedProductAvailable = await this.inventoryRepositoryPort.updateProductAvailable(
            productAvailable.id,
            newQuantity,
        );

        if (!updatedProductAvailable) {
            throw new InternalServerErrorException('Failed to update product available');
        }

        return updatedProductAvailable;
    }
}
