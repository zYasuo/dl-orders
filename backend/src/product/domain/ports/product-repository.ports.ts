import { Product } from '../entities/product.entity';

export abstract class IProductRepositoryPort {
    abstract create(input: { name: string; description: string; price: number }): Promise<Product | null>;
    abstract findById(id: string): Promise<Product | null>;
}
