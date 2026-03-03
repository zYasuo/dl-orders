import { Injectable } from '@nestjs/common';
import { TCreateOrder } from '../dto/create-order.dto';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { OrderWasCreatedEvent } from '../../domain/events/order-was-created.event';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly ordersRepositoryPort: IOrdersRepositoryPort,
    private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
  ) {}

  async execute(input: TCreateOrder) {
    const order = await this.ordersRepositoryPort.create({
      description: input.description,
    });

    await this.orderEventsPublisherPort.publishOrderWasCreated(
      new OrderWasCreatedEvent(order),
    );

    return order;
  }
}
