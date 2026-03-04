import { Product } from '../../product/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../product/domain/ports/product-repository.ports';

export class InMemoryProductRepository extends IProductRepositoryPort {
    private readonly products = new Map<string, Product>();

    async create(input: { name: string; description: string; price: number }): Promise<Product | null> {
        const now = new Date();
        const product = new Product(crypto.randomUUID(), input.name, input.description, input.price, now, now);
        this.products.set(product.id, product);
        return product;
    }

    async findById(id: string): Promise<Product | null> {
        return this.products.get(id) ?? null;
    }

    async findByName(name: string): Promise<Product | null> {
        return Array.from(this.products.values()).find((p) => p.name === name) ?? null;
    }

    async update(input: { id: string; name: string; description: string; price: number }): Promise<Product | null> {
        const { id, name, description, price } = input;
        const product = this.products.get(id);
        if (!product) return null;
        const updated = new Product(product.id, name, description, price, product.createdAt, new Date());
        this.products.set(id, updated);
        return updated;
    }
}
