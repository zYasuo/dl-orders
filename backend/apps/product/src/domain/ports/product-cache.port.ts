import { ProductEntity } from '../entities/product.entity';

export abstract class IProductCachePort {
  abstract getById(id: string): Promise<ProductEntity | null>;
  abstract getAll(): Promise<ProductEntity[] | null>;
  abstract set(product: ProductEntity, ttlSeconds: number): Promise<void>;
  abstract setAll(products: ProductEntity[], ttlSeconds: number): Promise<void>;
  abstract invalidate(id: string): Promise<void>;
}
