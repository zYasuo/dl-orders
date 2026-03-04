import { Product } from '../entities/product.entity';

export abstract class IProductRepositoryPort {
    abstract create(input: { name: string; description: string; price: number }): Promise<Product | null>;
    abstract findById(id: string): Promise<Product | null>;
    abstract findByName(name: string): Promise<Product | null>;
    abstract update(input: { id: string; name: string; description: string; price: number }): Promise<Product | null>;
}
