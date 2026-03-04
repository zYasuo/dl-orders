import { Injectable } from '@nestjs/common';
import { TCreateStockWithProductRelation } from 'src/stock/application/dto/create-stock-with-product-relation.schema';
import { DbService } from '../../../../infrastructure/db/db.service';
import { Stock } from '../../../domain/entities/stock.entity';
import { IStockRepositoryPort } from '../../../domain/ports/stock-repository.port';

@Injectable()
export class StockRepository extends IStockRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }
    async create(input: TCreateStockWithProductRelation): Promise<Stock | null> {
        const { name, quantity, productId } = input;

        const now = new Date();

        const row = await this.db.stock.create({
            data: { name, quantity, productId, createdAt: now, updatedAt: now },
        });

        if (!row) return null;

        return new Stock(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async findByProductId(productId: string): Promise<Stock | null> {
        const row = await this.db.stock.findUnique({
            where: { productId },
        });

        if (!row) return null;

        return new Stock(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async findByName(name: string): Promise<Stock | null> {
        const row = await this.db.stock.findFirst({
            where: { name },
        });

        if (!row) return null;

        return new Stock(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async updateQuantity(id: string, quantity: number): Promise<Stock | null> {
        const row = await this.db.stock.update({
            where: { id },
            data: { quantity },
        });

        if (!row) return null;

        return new Stock(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async delete(id: string): Promise<Stock | null> {
        const row = await this.db.stock.delete({
            where: { id },
        });

        if (!row) return null;

        return new Stock(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }
}
