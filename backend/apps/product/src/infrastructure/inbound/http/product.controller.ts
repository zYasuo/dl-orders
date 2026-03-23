import { Body, Controller, Param, Query } from '@nestjs/common';
import { Paginated, ZodValidationPipe } from '@app/shared';
import {
  SCreateProduct,
  type TCreateProduct,
} from '../../../application/dto/create-product.schema';
import {
  SFindAllProductsQuery,
  type TFindAllProductsQuery,
} from '../../../application/dto/find-all-products-query.schema';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { FindAllProductsUseCase } from '../../../application/use-cases/find-all-products.use-case';
import { FindProductByIdUseCase } from '../../../application/use-cases/find-product-by-id.use-case';
import { ProductEntity } from '../../../domain/entities/product.entity';
import { ProductDoc, ApiProducts } from './docs/product-doc.decorator';

@ApiProducts()
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
  ) {}

  @ProductDoc.List()
  async findAll(
    @Query(new ZodValidationPipe(SFindAllProductsQuery)) query: TFindAllProductsQuery,
  ): Promise<Paginated<ProductEntity>> {
    return this.findAllProductsUseCase.execute(query.page, query.limit);
  }

  @ProductDoc.Create()
  async create(
    @Body(new ZodValidationPipe(SCreateProduct)) input: TCreateProduct,
  ): Promise<ProductEntity> {
    return this.createProductUseCase.execute(input);
  }

  @ProductDoc.GetById()
  async findById(@Param('id') id: string): Promise<ProductEntity> {
    return this.findProductByIdUseCase.execute(id);
  }
}
