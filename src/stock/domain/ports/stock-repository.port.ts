import { Stock } from '../entities/stock.entity';

export abstract class StockRepositoryPort {
  abstract findById(id: string): Promise<Stock | null>;
  abstract findByName(name: string): Promise<Stock | null>;
  abstract updateQuantity(id: string, quantity: number): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
