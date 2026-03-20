import { ProductEntity } from '../entities/product.entity';

export abstract class ProductRepositoryPort {
  abstract create(entity: ProductEntity): Promise<ProductEntity | null>;
  abstract findById(id: string): Promise<ProductEntity | null>;
  abstract findByName(name: string): Promise<ProductEntity | null>;
  abstract findAll(): Promise<ProductEntity[] | null>;
  abstract update(entity: ProductEntity): Promise<ProductEntity | null>;
}
