import { Order } from '../entities/order.entity';

export abstract class IOrdersRepositoryPort {
  abstract create(input: { description: string }): Promise<Order>;
  abstract findAll(): Promise<Order[]>;
}
