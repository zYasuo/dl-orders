import { Product } from '../../product/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../product/domain/ports/product-repository.ports';
import { ICreateProduct, IUpdateProduct } from '../../product/domain/types/product-repository.types';

export class InMemoryProductRepository extends IProductRepositoryPort {
    private readonly products = new Map<string, Product>();

    async create(params: ICreateProduct): Promise<Product | null> {
        const { name, description, price } = params;
        const now = new Date();
        const product = new Product(crypto.randomUUID(), name, description, price, now, now);
        this.products.set(product.id, product);
        return product;
    }

    async findById(id: string): Promise<Product | null> {
        return this.products.get(id) ?? null;
    }

    async findByName(name: string): Promise<Product | null> {
        return Array.from(this.products.values()).find((p) => p.name === name) ?? null;
    }

    async update(id: string, data: IUpdateProduct): Promise<Product | null> {
        const { name, description, price } = data;

        const product = this.products.get(id);
        if (!product) return null;
        const updated = new Product(product.id, name, description, price, product.createdAt, new Date());
        this.products.set(id, updated);
        return updated;
    }
}
