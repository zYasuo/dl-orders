import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductCachePort } from '../../domain/ports/product-cache.port';

const PRODUCT_CACHE_TTL_SECONDS = 300;

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    private readonly productRepositoryPort: ProductRepositoryPort,
    private readonly productCache: ProductCachePort,
  ) {}

  async execute(): Promise<ProductEntity[] | null> {
    const cached = await this.productCache.getAll();
    if (cached !== null) return cached;

    const products = await this.productRepositoryPort.findAll();

    if (products) {
      await this.productCache.setAll(products, PRODUCT_CACHE_TTL_SECONDS);
    }

    return products;
  }
}
