import { Order } from '../entities/order.entity';

export abstract class OrdersRepositoryPort {
  abstract create(input: { description: string }): Promise<Order>;
  abstract findAll(): Promise<Order[]>;
}
