import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@app/shared';
import { CreateProductDto, SCreateProduct, type TCreateProduct } from '../../../application/dto/create-product.schema';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { FindProductByIdUseCase } from '../../../application/use-cases/find-product-by-id.use-case';
import { Product } from '../../../domain/entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly findProductByIdUseCase: FindProductByIdUseCase,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create product' })
    @ApiBody({ type: CreateProductDto })
    @ApiResponse({ status: 201, description: 'Product created' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async create(@Body(new ZodValidationPipe(SCreateProduct)) input: TCreateProduct): Promise<Product> {
        return this.createProductUseCase.execute(input);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product found' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findById(@Param('id') id: string): Promise<Product> {
        return this.findProductByIdUseCase.execute(id);
    }
}
