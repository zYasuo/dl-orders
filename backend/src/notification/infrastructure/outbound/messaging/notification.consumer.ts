import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationWasSendEvent } from 'src/notification/domain/events/notification-was-send.events';
import { INotificationEventsConsumerPort } from 'src/notification/domain/ports/notification-events-consumer.ports';

@Injectable()
export class NotificationRabbitMqConsumer extends INotificationEventsConsumerPort {
    constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) {
        super();
    }

    async consume(event: NotificationWasSendEvent): Promise<void> {
        this.client.emit('notification.was_send', event);
    }
}
