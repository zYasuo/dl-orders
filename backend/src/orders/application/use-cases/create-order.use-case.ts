import { Injectable } from '@nestjs/common';
import { OrderWasCreatedEvent } from '../../domain/events/order-was-created.event';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { TCreateOrder } from '../dto/create-order.dto';

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

        await this.orderEventsPublisherPort.publishOrderWasCreated(new OrderWasCreatedEvent(order));

        return order;
    }
}
