import { Product } from '../entities/product.entity';

export abstract class IProductCachePort {
    abstract getById(id: string): Promise<Product | null>;
    abstract set(product: Product, ttlSeconds: number): Promise<void>;
    abstract invalidate(id: string): Promise<void>;
}
