import { TCreateStockWithProductRelation } from 'src/stock/application/dto/create-stock-with-product-relation.schema';
import { Stock } from '../entities/stock.entity';

export abstract class IStockRepositoryPort {
    abstract create(input: TCreateStockWithProductRelation): Promise<Stock | null>;
    abstract findByProductId(productId: string): Promise<Stock | null>;
    abstract findByName(name: string): Promise<Stock | null>;
    abstract updateQuantity(id: string, quantity: number): Promise<Stock | null>;
    abstract delete(id: string): Promise<Stock | null>;
}
