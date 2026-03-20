import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductCachePort } from '../../domain/ports/product-cache.port';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { TCreateProduct } from '../dto/create-product.schema';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepositoryPort: ProductRepositoryPort,
    private readonly productCache: ProductCachePort,
  ) {}

  async execute(input: TCreateProduct): Promise<ProductEntity> {
    const { name, description, price, imageUrl } = input;

    const existingProduct = await this.productRepositoryPort.findByName(name);

    if (existingProduct) {
      throw new BadRequestException('Product already exists');
    }

    const createdProduct = await this.productRepositoryPort.create(
      ProductEntity.create({ name, description, price, imageUrl }),
    );

    if (!createdProduct) {
      throw new InternalServerErrorException('Failed to create product');
    }

    await this.productCache.invalidate(createdProduct.id);
    return createdProduct;
  }
}
