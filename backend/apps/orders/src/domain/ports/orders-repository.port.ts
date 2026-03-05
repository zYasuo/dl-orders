import { Order } from '../entities/order.entity';
import { ICreateOrder } from '../types/order-repository.types';

export abstract class IOrdersRepositoryPort {
    abstract create(input: ICreateOrder): Promise<Order | null>;
    abstract findById(id: string): Promise<Order | null>;
    abstract updateStatus(id: string, status: string): Promise<Order | null>;
}
