import { Injectable } from '@nestjs/common';
import { StockRepositoryPort } from '../../../../domain/stock/ports/stock-repository.port';
import { DbService } from '../db/db.service';
import { Stock } from '../../../../domain/stock/entities/stock.entities';

@Injectable()
export class StockRepository extends StockRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async findById(id: string): Promise<Stock | null> {
        const row = await this.db.stock.findUnique({
            where: { id },
        });

        if (!row) return null;
        
        return new Stock(row.id, row.name, row.price, row.quantity, row.description, row.createdAt);
    }

    async findByName(name: string): Promise<Stock | null> {
        const row = await this.db.stock.findFirst({
            where: { name },
        });

        if (!row) return null;

        return new Stock(row.id, row.name, row.price, row.quantity, row.description, row.createdAt);
    }

    async updateQuantity(id: string, quantity: number): Promise<void> {
        await this.db.stock.update({
            where: { id },
            data: { quantity },
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.stock.delete({
            where: { id },
        });
    }
}
