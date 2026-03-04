import { Injectable } from '@nestjs/common';
import { DbService } from 'src/infrastructure/db/db.service';
import { Product } from 'src/product/domain/entities/product.entity';
import { IProductRepositoryPort } from '../../domain/ports/product-repository.ports';

@Injectable()
export class ProductRepository extends IProductRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(input: { name: string; description: string; price: number }): Promise<Product | null> {
        const { name, description, price } = input;
        const now = new Date();

        const product = await this.db.product.create({
            data: { name, description, price, createdAt: now, updatedAt: now },
        });

        if (!product) return null;

        return new Product(product.id, product.name, product.description!, product.price, product.createdAt, product.updatedAt);
    }

    async findById(id: string): Promise<Product | null> {
        const product = await this.db.product.findUnique({
            where: { id },
        });

        if (!product) return null;

        return new Product(product.id, product.name, product.description!, product.price, product.createdAt, product.updatedAt);
    }
}
