import { Stock } from '../entities/stock.entity';

export abstract class IStockRepositoryPort {
    abstract findByProductId(productId: string): Promise<Stock | null>;
    abstract updateQuantity(id: string, quantity: number): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
