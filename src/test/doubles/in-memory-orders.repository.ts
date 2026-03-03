import { IOrdersRepositoryPort } from '../../orders/domain/ports/orders-repository.port';
import { Order } from '../../orders/domain/entities/order.entity';

export class InMemoryOrdersRepository extends IOrdersRepositoryPort {
  private readonly orders = new Map<string, Order>();

  async create(input: { description: string }): Promise<Order> {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const order = new Order(id, input.description, createdAt);
    this.orders.set(id, order);
    return order;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
}
