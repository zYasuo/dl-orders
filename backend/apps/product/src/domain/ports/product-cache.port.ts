import { ProductEntity } from '../entities/product.entity';

export abstract class ProductCachePort {
  abstract getById(id: string): Promise<ProductEntity | null>;
  abstract set(product: ProductEntity, ttlSeconds: number): Promise<void>;
  abstract invalidate(id: string): Promise<void>;
}
