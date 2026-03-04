import { Injectable } from '@nestjs/common';
import { DbService } from '../../../../infrastructure/db/db.service';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../../domain/ports/orders-repository.port';

@Injectable()
export class OrdersRepository extends IOrdersRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(input: { productId: string; quantity: number; description: string }): Promise<Order | null> {
        const order = await this.db.order.create({
            data: {
                productId: input.productId,
                quantity: input.quantity,
                description: input.description,
            },
        });

        if (!order) return null;

        return new Order({
            id: order.id,
            productId: order.productId,
            quantity: order.quantity,
            description: order.description,
            status: order.status as OrderStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        });
    }

    async findById(id: string): Promise<Order | null> {
        const item = await this.db.order.findUnique({
            where: {
                id,
            },
        });

        return item
            ? new Order({
                  id: item.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  description: item.description,
                  status: item.status as OrderStatus,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
              })
            : null;
    }
}
