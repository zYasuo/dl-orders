import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderWasCreatedEvent } from '../../domain/events/order-was-created.event';
import { IOrderEventsPublisherPort } from '../../domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { ICreateOrder } from '../../domain/types/order-repository.types';
import { TCreateOrder } from '../dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
    constructor(
        private readonly ordersRepositoryPort: IOrdersRepositoryPort,
        private readonly orderEventsPublisherPort: IOrderEventsPublisherPort,
    ) {}

    async execute(input: TCreateOrder) {
        const { productId, quantity, description } = input;

        const createInput: ICreateOrder = {
            productId,
            quantity,
            description,
        };
        const order = await this.ordersRepositoryPort.create(createInput);

        if (!order) {
            throw new InternalServerErrorException('Failed to create order');
        }

        await this.orderEventsPublisherPort.publishOrderWasCreated(new OrderWasCreatedEvent(order));

        return order;
    }
}
