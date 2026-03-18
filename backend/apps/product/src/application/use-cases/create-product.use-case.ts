import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductEntity } from '../../domain/entities/product.entity';
import { IProductCachePort } from '../../domain/ports/product-cache.port';
import { IProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ICreateProduct } from '../../domain/types/product-repository.types';
import { TCreateProduct } from '../dto/create-product.schema';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepositoryPort: IProductRepositoryPort,
    private readonly productCache: IProductCachePort,
  ) {}

  async execute(input: TCreateProduct): Promise<ProductEntity> {
    const { name, description, price, imageUrl } = input;

    const existingProduct = await this.productRepositoryPort.findByName(name);

    if (existingProduct) {
      throw new BadRequestException('Product already exists');
    }

    const createInput: ICreateProduct = { name, description, price, imageUrl };

    const createdProduct = await this.productRepositoryPort.create(createInput);

    if (!createdProduct) {
      throw new InternalServerErrorException('Failed to create product');
    }

    await this.productCache.invalidate(createdProduct.id);
    return createdProduct;
  }
}
