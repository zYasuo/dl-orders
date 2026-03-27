import { OrderEntity } from '../entities/order.entity';

export abstract class OrdersRepositoryPort {
  abstract create(entity: OrderEntity): Promise<OrderEntity>;
  abstract findById(id: string): Promise<OrderEntity | null>;
  abstract findPage(page: number, limit: number): Promise<OrderEntity[]>;
  abstract count(): Promise<number>;
  abstract findPageByRecipient(recipientEmail: string, page: number, limit: number): Promise<OrderEntity[]>;
  abstract countByRecipient(recipientEmail: string): Promise<number>;
  abstract updateStatus(id: string, status: string): Promise<OrderEntity | null>;
  abstract confirmIfPending(orderId: string): Promise<OrderEntity | null>;
  abstract cancelIfPending(orderId: string): Promise<OrderEntity | null>;
  abstract findByIdempotencyKey(idempotencyKey: string): Promise<OrderEntity | null>;
}
