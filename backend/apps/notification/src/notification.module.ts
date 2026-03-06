import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './infrastructure/db/db.module';
import { DynamoDBModule } from './infrastructure/dynamodb/dynamodb.module';
import { IEmailSenderPort } from './domain/ports/email-sender.port';
import { INotificationAuditLogPort } from './domain/ports/notification-audit-log.port';
import { INotificationRepositoryPort } from './domain/ports/notification-repository.port';
import { OrderConfirmedConsumer } from './infrastructure/inbound/messaging/order-confirmed.consumer';
import { ResendEmailSender } from './infrastructure/outbound/email/resend-email.sender';
import { DynamoDBNotificationAuditLogRepository } from './infrastructure/outbound/persistence/dynamodb-notification-audit-log.repository';
import { NotificationRepository } from './infrastructure/outbound/persistence/notification.repository';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { HandleOrderConfirmedUseCase } from './application/use-cases/handle-order-confirmed.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/notification/.env',
            isGlobal: true,
        }),
        DbModule,
        DynamoDBModule.forRoot(),
    ],
    controllers: [OrderConfirmedConsumer],
    providers: [
        CreateNotificationUseCase,
        HandleOrderConfirmedUseCase,
        SendNotificationEmailUseCase,
        { provide: INotificationRepositoryPort, useClass: NotificationRepository },
        { provide: IEmailSenderPort, useClass: ResendEmailSender },
        { provide: INotificationAuditLogPort, useClass: DynamoDBNotificationAuditLogRepository },
    ],
})
export class NotificationModule {}
