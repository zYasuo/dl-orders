import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrderEventsPublisherPort } from '../../../../../domain/orders/ports/order-events-publisher.port';
import { OrderWasCreatedEvent } from '../../../../../domain/orders/events/order-was-created.event';

@Injectable()
export class OrdersRabbitMqPublisher extends OrderEventsPublisherPort {
    constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) {
        super();
    }

    async publishOrderWasCreated(event: OrderWasCreatedEvent): Promise<void> {
        this.client.emit('order.was_created', {
            id: event.order.id,
            description: event.order.description,
            createdAt: event.order.createdAt.toISOString(),
        });
    }
}
