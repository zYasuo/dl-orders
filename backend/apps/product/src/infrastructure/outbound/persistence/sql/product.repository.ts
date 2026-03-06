import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/product-client';
import { DbService } from '../../../db/db.service';
import { Product } from '../../../../domain/entities/product.entity';
import { IProductRepositoryPort } from '../../../../domain/ports/product-repository.port';
import { ICreateProduct, IUpdateProduct } from '../../../../domain/types/product-repository.types';

@Injectable()
export class ProductRepository extends IProductRepositoryPort {
    constructor(private readonly db: DbService) { super(); }

    async create(params: ICreateProduct): Promise<Product | null> {
        const { name, description, price } = params;
        const now = new Date();
        const row = await this.db.product.create({
            data: { name, description, price, createdAt: now, updatedAt: now },
        });
        return new Product(row.id, row.name, row.description!, row.price, row.createdAt, row.updatedAt);
    }

    async findById(id: string): Promise<Product | null> {
        const product = await this.db.product.findUnique({ where: { id } });
        if (!product) return null;
        return new Product(product.id, product.name, product.description!, product.price, product.createdAt, product.updatedAt);
    }

    async findByName(name: string): Promise<Product | null> {
        const product = await this.db.product.findUnique({ where: { name } });
        if (!product) return null;
        return new Product(product.id, product.name, product.description!, product.price, product.createdAt, product.updatedAt);
    }

    async update(id: string, data: IUpdateProduct): Promise<Product | null> {
        const { name, description, price } = data;
        const now = new Date();
        try {
            const row = await this.db.product.update({
                where: { id },
                data: { name, description, price, updatedAt: now },
            });
            return new Product(row.id, row.name, row.description!, row.price, row.createdAt, row.updatedAt);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
            throw e;
        }
    }
}
