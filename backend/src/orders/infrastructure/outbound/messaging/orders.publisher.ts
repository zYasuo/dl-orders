import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrderWasCreatedEvent } from '../../../domain/events/order-was-created.event';
import { IOrderEventsPublisherPort } from '../../../domain/ports/order-events-publisher.port';

@Injectable()
export class OrdersRabbitMqPublisher extends IOrderEventsPublisherPort {
    constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) {
        super();
    }

    async publishOrderWasCreated(event: OrderWasCreatedEvent): Promise<void> {
        this.client.emit('order.was_created', {
            id: event.order.id,
            productId: event.order.productId,
            quantity: event.order.quantity,
            description: event.order.description,
            recipient: event.order.recipient,
            createdAt: event.order.createdAt.toISOString(),
            updatedAt: event.order.updatedAt.toISOString(),
        });
    }
}
