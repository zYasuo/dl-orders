import { Injectable } from '@nestjs/common';
import { DbService } from '../../../../infrastructure/db/db.service';
import { IOrdersRepositoryPort } from '../../../domain/ports/orders-repository.port';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';

@Injectable()
export class OrdersRepository extends IOrdersRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(input: { description: string }): Promise<Order> {
        const order = await this.db.order.create({
            data: {
                description: input.description,
            },
        });

        return new Order({
            id: order.id,
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
                  description: item.description,
                  status: item.status as OrderStatus,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
              })
            : null;
    }
}
