import { OrderEntity } from '../entities/order.entity';
import { ICreateOrder } from '../types/order-repository.types';

export abstract class IOrdersRepositoryPort {
    abstract create(input: ICreateOrder): Promise<OrderEntity | null>;
    abstract findById(id: string): Promise<OrderEntity | null>;
    abstract updateStatus(id: string, status: string): Promise<OrderEntity | null>;
}
