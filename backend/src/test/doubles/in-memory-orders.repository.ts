import { Order, OrderStatus } from '../../orders/domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../orders/domain/ports/orders-repository.port';
import { ICreateOrder } from '../../orders/domain/types/order-repository.types';

export class InMemoryOrdersRepository extends IOrdersRepositoryPort {
    private readonly orders = new Map<string, Order>();

    async create(input: ICreateOrder): Promise<Order> {
        const { description, productId, quantity, recipient } = input;

        const now = new Date();
        const order = new Order({
            id: crypto.randomUUID(),
            description,
            productId,
            quantity,
            status: OrderStatus.PENDING,
            recipient,
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
