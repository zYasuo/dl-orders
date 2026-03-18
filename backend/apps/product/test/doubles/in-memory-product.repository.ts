import { ProductEntity } from '../../src/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../src/domain/ports/product-repository.port';
import { ICreateProduct, IUpdateProduct } from '../../src/domain/types/product-repository.types';

export class InMemoryProductRepository extends IProductRepositoryPort {
  private readonly products = new Map<string, ProductEntity>();

  async create(params: ICreateProduct): Promise<ProductEntity | null> {
    const product = ProductEntity.create(params);
    this.products.set(product.id, product);
    return product;
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

  async update(id: string, data: IUpdateProduct): Promise<ProductEntity | null> {
    const product = this.products.get(id);
    if (!product) return null;
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl : product.imageUrl;
    const updated = new ProductEntity(
      product.id,
      data.name,
      data.description,
      data.price,
      imageUrl ?? null,
      product.createdAt,
      new Date(),
    );
    this.products.set(id, updated);
    return updated;
  }
}
