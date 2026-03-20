import { ProductEntity } from '../../src/domain/entities/product.entity';
import { ProductRepositoryPort } from '../../src/domain/ports/product-repository.port';

export class InMemoryProductRepository extends ProductRepositoryPort {
  private readonly products = new Map<string, ProductEntity>();

  async create(entity: ProductEntity): Promise<ProductEntity | null> {
    this.products.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.products.get(id) ?? null;
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    return Array.from(this.products.values()).find((p) => p.name === name) ?? null;
  }

  async findAll(): Promise<ProductEntity[] | null> {
    const list = Array.from(this.products.values());
    return list.length ? list : null;
  }

  async update(entity: ProductEntity): Promise<ProductEntity | null> {
    if (!this.products.has(entity.id)) return null;
    this.products.set(entity.id, entity);
    return entity;
  }
}
