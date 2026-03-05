import { Order, OrderStatus } from '../../src/domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../src/domain/ports/orders-repository.port';
import { ICreateOrder } from '../../src/domain/types/order-repository.types';

export class InMemoryOrdersRepository extends IOrdersRepositoryPort {
    private readonly orders = new Map<string, Order>();

    async create(input: ICreateOrder): Promise<Order> {
        const now = new Date();
        const order = new Order({
            id: crypto.randomUUID(),
            description: input.description,
            productId: input.productId,
            quantity: input.quantity,
            status: OrderStatus.PENDING,
            recipient: input.recipient,
            createdAt: now,
            updatedAt: now,
        });
        this.orders.set(order.id, order);
        return order;
    }

    async findById(id: string): Promise<Order | null> {
        return this.orders.get(id) ?? null;
    }

    async updateStatus(id: string, status: string): Promise<Order | null> {
        const order = this.orders.get(id);
        if (!order) return null;
        const updated = new Order({
            id: order.id,
            description: order.description,
            productId: order.productId,
            quantity: order.quantity,
            status: status as OrderStatus,
            recipient: order.recipient,
            createdAt: order.createdAt,
            updatedAt: new Date(),
        });
        this.orders.set(id, updated);
        return updated;
    }
}
