import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class FindOrderByIdUseCase {
    constructor(private readonly ordersRepositoryPort: IOrdersRepositoryPort) {}

    async execute(id: string): Promise<Order> {
        const order = await this.ordersRepositoryPort.findById(id);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }
}
