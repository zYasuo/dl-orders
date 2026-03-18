import { Injectable } from '@nestjs/common';
import { IInventoryRepositoryPort } from '../../domain/ports/inventory-repository.port';

@Injectable()
export class CheckQuantityInInventoryUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepositoryPort) {}

  async execute(): Promise<void> {
    const lowStock = await this.inventoryRepository.findLowStock();

    
  }
}
