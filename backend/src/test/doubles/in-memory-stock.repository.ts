import { Stock } from '../../stock/domain/entities/stock.entity';
import { IStockRepositoryPort } from '../../stock/domain/ports/stock-repository.port';

export class InMemoryStockRepository extends IStockRepositoryPort {
    private readonly stocks = new Map<string, Stock>();

    async findByProductId(productId: string): Promise<Stock | null> {
        return this.stocks.get(productId) ?? null;
    }

    async updateQuantity(id: string, quantity: number): Promise<void> {
        const stock = this.stocks.get(id);
        if (!stock) return;
        const updated = new Stock(stock.id, stock.name, quantity, stock.productId, stock.createdAt, stock.updatedAt);
        this.stocks.set(id, updated);
    }

    async delete(id: string): Promise<void> {
        this.stocks.delete(id);
    }

    seed(stock: Stock): void {
        this.stocks.set(stock.id, stock);
    }

    getQuantity(id: string): number | undefined {
        return this.stocks.get(id)?.quantity;
    }
}
