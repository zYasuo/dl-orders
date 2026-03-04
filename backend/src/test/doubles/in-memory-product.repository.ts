import { Product } from '../../product/domain/entrities/product.entity';
import { IProductRepositoryPort } from '../../product/domain/ports/product-repository.ports';

export class InMemoryProductRepository extends IProductRepositoryPort {
    private readonly products = new Map<string, Product>();

    async create(input: { name: string; description: string; price: number }): Promise<Product> {
        const product =
            'id' in input ? (input as Product) : new Product(crypto.randomUUID(), input.name, input.description, input.price, new Date(), new Date());
        this.products.set(product.id, product);
        return product;
    }

    async findById(id: string): Promise<Product | null> {
        return this.products.get(id) ?? null;
    }
}
