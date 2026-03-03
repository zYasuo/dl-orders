import { Order } from '../entities/order.entity';

export abstract class IOrdersRepositoryPort {
  abstract create(input: { description: string }): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
}
