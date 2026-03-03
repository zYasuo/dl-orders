import { Injectable } from '@nestjs/common';
import { DbService } from '../../../../infrastructure/db/db.service';
import { OrdersRepositoryPort } from '../../../domain/ports/orders-repository.port';
import { Order } from '../../../domain/entities/order.entity';

@Injectable()
export class OrdersRepository extends OrdersRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(input: { description: string }): Promise<Order> {
    const order = await this.db.order.create({
      data: {
        description: input.description,
      },
    });

    return new Order(order.id, order.description, order.createdAt);
  }

  async findAll(): Promise<Order[]> {
    const items = await this.db.order.findMany();

    return items.map((item) => new Order(item.id, item.description, item.createdAt));
  }
}
