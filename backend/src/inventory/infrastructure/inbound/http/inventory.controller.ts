import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
    SCreateInventoryWithProductRelation,
    type TCreateInventoryWithProductRelation,
} from 'src/inventory/application/dto/create-inventory-with-product-relation.schema';
import { CreateInventoryWithProductRelationUseCase } from 'src/inventory/application/use-cases/create-inventory-with-product-relation.use-case';
import { Inventory } from 'src/inventory/domain/entities/inventory.entity';

@Controller('inventories')
export class InventoryController {
    constructor(private readonly createInventoryWithProductRelationUseCase: CreateInventoryWithProductRelationUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(SCreateInventoryWithProductRelation))
    async create(@Body() input: TCreateInventoryWithProductRelation): Promise<Inventory> {
        return this.createInventoryWithProductRelationUseCase.execute(input);
    }
}
