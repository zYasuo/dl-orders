import { OrderEntity, OrderStatus } from '../../src/domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../src/domain/ports/orders-repository.port';

export class InMemoryOrdersRepository extends OrdersRepositoryPort {
  private readonly orders = new Map<string, OrderEntity>();

  async create(entity: OrderEntity): Promise<OrderEntity> {
    const existing = await this.findByIdempotencyKey(entity.idempotencyKey);
    if (existing) return existing;
    this.orders.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return this.orders.get(id) ?? null;
  }

  async findPage(page: number, limit: number): Promise<OrderEntity[]> {
    const sorted = [...this.orders.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const skip = (page - 1) * limit;
    return sorted.slice(skip, skip + limit);
  }

  async count(): Promise<number> {
    return this.orders.size;
  }

  async updateStatus(id: string, status: string): Promise<OrderEntity | null> {
    const order = this.orders.get(id);
    if (!order) return null;
    const updated = new OrderEntity({
      id: order.id,
      sequenceId: order.sequenceId,
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

  async cancelIfPending(orderId: string): Promise<OrderEntity | null> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== OrderStatus.PENDING) return null;
    return this.updateStatus(orderId, OrderStatus.CANCELLED);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<OrderEntity | null> {
    for (const order of this.orders.values()) {
      if (order.idempotencyKey === idempotencyKey) return order;
    }
    return null;
  }
}
