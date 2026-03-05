import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@app/shared';
import { SCreateProduct, type TCreateProduct } from '../../../application/dto/create-product.schema';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { Product } from '../../../domain/entities/product.entity';

@Controller('products')
export class ProductController {
    constructor(private readonly createProductUseCase: CreateProductUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(SCreateProduct))
    async create(@Body() input: TCreateProduct): Promise<Product> {
        return this.createProductUseCase.execute(input);
    }
}
