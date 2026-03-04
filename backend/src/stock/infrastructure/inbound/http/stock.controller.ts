import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
    SCreateStockWithProductRelation,
    type TCreateStockWithProductRelation,
} from 'src/stock/application/dto/create-stock-with-product-relation.schema';
import { CreateStockWithProductRelationUseCase } from 'src/stock/application/use-cases/create-stock-with-product-relation.use-case';
import { Stock } from 'src/stock/domain/entities/stock.entity';

@Controller('stocks')
export class StockController {
    constructor(private readonly createStockWithProductRelationUseCase: CreateStockWithProductRelationUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(SCreateStockWithProductRelation))
    async create(@Body() input: TCreateStockWithProductRelation): Promise<Stock> {
        return this.createStockWithProductRelationUseCase.execute(input);
    }
}
