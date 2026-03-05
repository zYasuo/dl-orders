import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/infrastructure/rabbitmq/rabbitmq.module';
import { IEmailSenderPort } from '../domain/ports/email-sender.ports';
import { INotificationRepositoryPort } from '../domain/ports/notification-repository.ports';
import { OrderWasCreatedNotificationConsumer } from '../infrastructure/inbound/messaging/order-was-created.consumer';
import { ResendEmailSender } from '../infrastructure/outbound/email/resend-email.sender';
import { NotificationRepository } from '../infrastructure/outbound/persistence/notification.repository';
import { CreateNotificationUseCase } from './use-cases/create-notification.use-case';
import { CreateNotificationWhenOrderCreatedUseCase } from './use-cases/create-notification-when-order-created.use-case';
import { SendNotificationEmailUseCase } from './use-cases/send-notification-email.use-case';

@Module({
    imports: [RabbitMQModule],
    controllers: [OrderWasCreatedNotificationConsumer],
    providers: [
        CreateNotificationUseCase,
        CreateNotificationWhenOrderCreatedUseCase,
        SendNotificationEmailUseCase,
        {
            provide: INotificationRepositoryPort,
            useClass: NotificationRepository,
        },
        {
            provide: IEmailSenderPort,
            useClass: ResendEmailSender,
        },
    ],
})
export class NotificationModule {}
