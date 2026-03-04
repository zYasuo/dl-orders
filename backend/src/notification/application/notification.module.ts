import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/infrastructure/rabbitmq/rabbitmq.module';
import { INotificationRepositoryPort } from '../domain/ports/notification-repository.ports';
import { OrderWasCreatedNotificationConsumer } from '../infrastructure/inbound/messaging/order-was-created.consumer';
import { NotificationRepository } from '../infrastructure/outbound/persistence/notification.repository';
import { CreateNotificationUseCase } from './use-cases/create-notification.use-case';
import { CreateNotificationWhenOrderCreatedUseCase } from './use-cases/create-notification-when-order-created.use-case';

@Module({
    imports: [RabbitMQModule],
    controllers: [OrderWasCreatedNotificationConsumer],
    providers: [
        CreateNotificationUseCase,
        CreateNotificationWhenOrderCreatedUseCase,
        {
            provide: INotificationRepositoryPort,
            useClass: NotificationRepository,
        },
    ],
})
export class NotificationModule {}
