import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@app/shared';
import { SCreateInventory, type TCreateInventory } from '../../../application/dto/create-inventory.schema';
import { CreateInventoryUseCase } from '../../../application/use-cases/create-inventory.use-case';
import { Inventory } from '../../../domain/entities/inventory.entity';

@Controller('inventories')
export class InventoryController {
    constructor(private readonly createInventoryUseCase: CreateInventoryUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(SCreateInventory))
    async create(@Body() input: TCreateInventory): Promise<Inventory> {
        return this.createInventoryUseCase.execute(input);
    }
}
