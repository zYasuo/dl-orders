import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class FindOrderByIdUseCase {
  constructor(private readonly ordersRepositoryPort: OrdersRepositoryPort) {}

  async execute(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepositoryPort.findById(id);

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }
}
