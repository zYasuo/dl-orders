import { Order } from '../entities/order.entity';

export abstract class IOrdersRepositoryPort {
    abstract create(input: { productId: string; quantity: number; description: string }): Promise<Order | null>;
    abstract findById(id: string): Promise<Order | null>;
}
