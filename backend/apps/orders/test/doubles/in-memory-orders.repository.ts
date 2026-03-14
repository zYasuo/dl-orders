import { OrderEntity, OrderStatus } from '../../src/domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../src/domain/ports/orders-repository.port';
import { ICreateOrder } from '../../src/domain/types/order-repository.types';

export class InMemoryOrdersRepository extends IOrdersRepositoryPort {
    private readonly orders = new Map<string, OrderEntity>();

    async create(input: ICreateOrder): Promise<OrderEntity> {
        const order = OrderEntity.create(input);
        this.orders.set(order.id, order);
        return order;
    }

    async findById(id: string): Promise<OrderEntity | null> {
        return this.orders.get(id) ?? null;
    }

    async updateStatus(id: string, status: string): Promise<OrderEntity | null> {
        const order = this.orders.get(id);
        if (!order) return null;
        const updated = new OrderEntity({
            id: order.id,
            description: order.description,
            productId: order.productId,
            quantity: order.quantity,
            status: status as OrderStatus,
            recipient: order.recipient,
            productName: order.productName,
            productDescription: order.productDescription,
            idempotencyKey: order.idempotencyKey,
            unitPrice: order.unitPrice,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt,
            updatedAt: new Date(),
        });
        this.orders.set(id, updated);
        return updated;
    }

    async confirmIfPending(orderId: string): Promise<OrderEntity | null> {
        const order = this.orders.get(orderId);
        if (!order || order.status !== OrderStatus.PENDING) return null;
        return this.updateStatus(orderId, OrderStatus.CONFIRMED);
    }

    async findByIdempotencyKey(idempotencyKey: string): Promise<OrderEntity | null> {
        for (const order of this.orders.values()) {
            if (order.idempotencyKey === idempotencyKey) return order;
        }
        return null;
    }
}
