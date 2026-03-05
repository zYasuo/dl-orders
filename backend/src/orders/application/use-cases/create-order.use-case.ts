import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IInventoryRepositoryPort } from 'src/inventory/domain/ports/inventory-repository.port';
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
        private readonly inventoryRepositoryPort: IInventoryRepositoryPort,
    ) {}

    async execute(input: TCreateOrder) {
        const { productId, quantity, description, recipient } = input;

        const inventory = await this.inventoryRepositoryPort.findByProductId(productId);

        if (!inventory) {
            throw new NotFoundException('Inventory not available for this product');
        }

        if (inventory.quantity < quantity) {
            throw new BadRequestException('Inventory quantity is not enough');
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
