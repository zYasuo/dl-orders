import { OrderEntity } from '../entities/order.entity';
import { ICreateOrder } from '../types/order-repository.types';

export abstract class OrdersRepositoryPort {
  abstract create(input: ICreateOrder): Promise<OrderEntity>;
  abstract findById(id: string): Promise<OrderEntity | null>;
  abstract updateStatus(id: string, status: string): Promise<OrderEntity | null>;
  abstract confirmIfPending(orderId: string): Promise<OrderEntity | null>;
  abstract findByIdempotencyKey(idempotencyKey: string): Promise<OrderEntity | null>;
}
