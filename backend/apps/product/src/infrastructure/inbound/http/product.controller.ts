import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ZodValidationPipe } from '@app/shared';
import { SCreateProduct, type TCreateProduct } from '../../../application/dto/create-product.schema';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { FindProductByIdUseCase } from '../../../application/use-cases/find-product-by-id.use-case';
import { Product } from '../../../domain/entities/product.entity';

@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly findProductByIdUseCase: FindProductByIdUseCase,
    ) {}

    @Post()
    async create(@Body(new ZodValidationPipe(SCreateProduct)) input: TCreateProduct): Promise<Product> {
        return this.createProductUseCase.execute(input);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Product> {
        return this.findProductByIdUseCase.execute(id);
    }
}
