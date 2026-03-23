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

  private sortedByCreatedAtDesc(): ProductEntity[] {
    return Array.from(this.products.values()).sort((a, b) => {
      const t = b.createdAt.getTime() - a.createdAt.getTime();
      return t !== 0 ? t : a.id.localeCompare(b.id);
    });
  }

  async findPage(page: number, limit: number): Promise<ProductEntity[]> {
    const sorted = this.sortedByCreatedAtDesc();
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }

  async count(): Promise<number> {
    return this.products.size;
  }

  async update(entity: ProductEntity): Promise<ProductEntity | null> {
    if (!this.products.has(entity.id)) return null;
    this.products.set(entity.id, entity);
    return entity;
  }
}
