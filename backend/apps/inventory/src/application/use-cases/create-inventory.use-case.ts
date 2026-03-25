import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CachePort } from '@app/shared';
import * as crypto from 'node:crypto';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import { InventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';
import { TCreateInventory } from '../dto/create-inventory.schema';

@Injectable()
export class CreateInventoryUseCase {
  private readonly listVersionKey = 'inventories:all:version';

  constructor(
    private readonly inventoryRepositoryPort: InventoryRepositoryPort,
    private readonly cache: CachePort,
  ) {}

  async execute(input: TCreateInventory): Promise<InventoryEntity> {
    const { productId, name, quantity, maxQuantity, minQuantity, lowStockThreshold, createdBy } =
      input;

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

    const inventoryEntity = InventoryEntity.create({
      id: crypto.randomUUID(),
      productId,
      name,
      quantity,
      maxQuantity,
      minQuantity,
      lowStockThreshold,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.inventoryRepositoryPort.create(inventoryEntity);

    if (!created) {
      throw new InternalServerErrorException('Failed to create inventory');
    }

    await this.cache.incr(this.listVersionKey);

    return created;
  }
}
