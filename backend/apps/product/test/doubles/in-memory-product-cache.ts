import { ProductEntity } from '../../src/domain/entities/product.entity';
import { IProductCachePort } from '../../src/domain/ports/product-cache.port';

export class InMemoryProductCache extends IProductCachePort {
  private readonly byId = new Map<string, ProductEntity>();

  async getById(id: string): Promise<ProductEntity | null> {
    return this.byId.get(id) ?? null;
  }

  async getAll(): Promise<ProductEntity[] | null> {
    const list = Array.from(this.byId.values());
    return list.length ? list : null;
  }

  async set(product: ProductEntity, _ttlSeconds: number): Promise<void> {
    this.byId.set(product.id, product);
  }

  async setAll(products: ProductEntity[], _ttlSeconds: number): Promise<void> {
    for (const p of products) this.byId.set(p.id, p);
  }

  async invalidate(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
