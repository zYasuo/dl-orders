import { StockRepositoryPort } from '../../stock/domain/ports/stock-repository.port';
import { Stock } from '../../stock/domain/entities/stock.entity';

export class InMemoryStockRepository extends StockRepositoryPort {
  private readonly stocks = new Map<string, Stock>();

  async findById(id: string): Promise<Stock | null> {
    return this.stocks.get(id) ?? null;
  }

  async findByName(name: string): Promise<Stock | null> {
    for (const stock of this.stocks.values()) {
      if (stock.name === name) return stock;
    }
    return null;
  }

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const stock = this.stocks.get(id);
    if (!stock) return;
    const updated = new Stock(
      stock.id,
      stock.name,
      stock.price,
      quantity,
      stock.description,
      stock.createdAt,
    );
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
