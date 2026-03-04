import { Stock } from '../entities/stock.entity';
import { ICreateStock } from '../types/stock-repository.types';

export abstract class IStockRepositoryPort {
    abstract create(input: ICreateStock): Promise<Stock | null>;
    abstract findByProductId(productId: string): Promise<Stock | null>;
    abstract findByName(name: string): Promise<Stock | null>;
    abstract updateQuantity(id: string, quantity: number): Promise<Stock | null>;
    abstract delete(id: string): Promise<Stock | null>;
}
