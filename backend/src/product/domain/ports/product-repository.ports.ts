import { Product } from '../entrities/product.entity';

export abstract class IProductRepositoryPort {
    abstract create(input: { name: string; description: string; price: number }): Promise<Product>;
    abstract findById(id: string): Promise<Product | null>;
}
