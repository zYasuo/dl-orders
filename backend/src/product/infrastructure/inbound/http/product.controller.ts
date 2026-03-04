import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SCreateProduct, type TCreateProduct } from 'src/product/application/dto/create-product.schema';
import { CreateProductUseCase } from 'src/product/application/use-cases/create-product.use-case';
import { Product } from 'src/product/domain/entities/product.entity';

@Controller('products')
export class ProductController {
    constructor(private readonly createProductUseCase: CreateProductUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(SCreateProduct))
    async create(@Body() input: TCreateProduct): Promise<Product> {
        return this.createProductUseCase.execute(input);
    }
}
