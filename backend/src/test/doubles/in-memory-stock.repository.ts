import { TCreateStockWithProductRelation } from 'src/stock/application/dto/create-stock-with-product-relation.schema';
import { Stock } from '../../stock/domain/entities/stock.entity';
import { IStockRepositoryPort } from '../../stock/domain/ports/stock-repository.port';

export class InMemoryStockRepository extends IStockRepositoryPort {
    private readonly stocks = new Map<string, Stock>();

    async create(input: TCreateStockWithProductRelation): Promise<Stock | null> {
        const { name, quantity, productId } = input;

        const existingStock = await this.findByProductId(productId);
        if (existingStock) return null;

        const existingStockByName = await this.findByName(name);
        if (existingStockByName) return null;

        const stock = new Stock(crypto.randomUUID(), name, quantity, productId, new Date(), new Date());
        this.stocks.set(stock.id, stock);

        return stock;
    }

    async findByProductId(productId: string): Promise<Stock | null> {
        return Array.from(this.stocks.values()).find((stock) => stock.productId === productId) ?? null;
    }

    async findByName(name: string): Promise<Stock | null> {
        return Array.from(this.stocks.values()).find((stock) => stock.name === name) ?? null;
    }

    async updateQuantity(id: string, quantity: number): Promise<Stock | null> {
        const stock = this.stocks.get(id);
        if (!stock) return null;

        const updated = new Stock(stock.id, stock.name, quantity, stock.productId, stock.createdAt, stock.updatedAt);
        this.stocks.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<Stock | null> {
        const stock = this.stocks.get(id);

        if (!stock) return null;

        this.stocks.delete(id);

        return stock;
    }

    seed(stock: Stock): void {
        this.stocks.set(stock.id, stock);
    }

    getQuantity(id: string): number | undefined {
        return this.stocks.get(id)?.quantity;
    }
}
