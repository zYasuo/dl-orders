import { IOrdersRepositoryPort } from '../../orders/domain/ports/orders-repository.port';
import { Order, OrderStatus } from '../../orders/domain/entities/order.entity';

export class InMemoryOrdersRepository extends IOrdersRepositoryPort {
    private readonly orders = new Map<string, Order>();

    async create(input: { description: string }): Promise<Order> {
        const now = new Date();
        const order = new Order({
            id: crypto.randomUUID(),
            description: input.description,
            status: OrderStatus.PENDING,
            createdAt: now,
            updatedAt: now,
        });
        this.orders.set(order.id, order);
        return order;
    }

    async findById(id: string): Promise<Order | null> {
        return this.orders.get(id) ?? null;
    }
}
