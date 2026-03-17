import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../../domain/entities/product.entity';
import { IProductCachePort } from '../../domain/ports/product-cache.port';
import { IProductRepositoryPort } from '../../domain/ports/product-repository.port';

const PRODUCT_CACHE_TTL_SECONDS = 300;

@Injectable()
export class FindProductByIdUseCase {
    constructor(
        private readonly productRepositoryPort: IProductRepositoryPort,
        private readonly productCache: IProductCachePort,
    ) {}

    async execute(id: string): Promise<ProductEntity> {
        const cached = await this.productCache.getById(id);
        if (cached !== null) return cached;

        const product = await this.productRepositoryPort.findById(id);
        if (!product) {
            throw new NotFoundException(`Product ${id} not found`);
        }

        await this.productCache.set(product, PRODUCT_CACHE_TTL_SECONDS);
        return product;
    }
}
