import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IProductRepositoryPort } from 'src/product/domain/ports/product-repository.ports';
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
        private readonly productRepositoryPort: IProductRepositoryPort,
    ) {}

    async execute(input: TCreateOrder) {
        const { productId, quantity, description, recipient } = input;

        const existingProduct = await this.productRepositoryPort.findById(productId);

        if (!existingProduct) {
            throw new NotFoundException('Product not found');
        }

        const createInput: ICreateOrder = {
            productId,
            quantity,
            description,
            recipient,
        };

        const order = await this.ordersRepositoryPort.create(createInput);

        if (!order) {
            throw new InternalServerErrorException('Failed to create order');
        }

        await this.orderEventsPublisherPort.publishOrderWasCreated(new OrderWasCreatedEvent(order));

        return order;
    }
}
