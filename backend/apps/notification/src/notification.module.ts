import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from '@app/shared';
import { DbModule } from './infrastructure/db/db.module';
import { IEmailSenderPort } from './domain/ports/email-sender.port';
import { INotificationAuditLogPort } from './domain/ports/notification-audit-log.port';
import { INotificationRepositoryPort } from './domain/ports/notification-repository.port';
import { INotificationTemplatePort } from './domain/ports/notification-template.port';
import { IUserNotificationsPort } from './domain/ports/user-notifications.port';
import { NotificationsController } from './infrastructure/inbound/http/notifications.controller';
import { AccountLockedNotifyConsumer } from './infrastructure/inbound/messaging/account-locked-notify.consumer';
import { OrderConfirmedConsumer } from './infrastructure/inbound/messaging/order-confirmed.consumer';
import { OtpSendRequestedConsumer } from './infrastructure/inbound/messaging/otp-send-requested.consumer';
import { ResendEmailSender } from './infrastructure/outbound/email/resend-email.sender';
import { MongoNotificationAuditLogRepository } from './infrastructure/outbound/persistence/mongodb/notification-audit-log.repository';
import { MongoUserNotificationsRepository } from './infrastructure/outbound/persistence/mongodb/user-notifications.repository';
import { NotificationRepository } from './infrastructure/outbound/persistence/sql/notification.repository';
import { OrderConfirmedTemplateAdapter } from './infrastructure/outbound/templates/order-confirmed-template.adapter';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { HandleOrderConfirmedUseCase } from './application/use-cases/handle-order-confirmed.use-case';
import { HandleAccountLockedNotifyUseCase } from './application/use-cases/handle-account-locked-notify.use-case';
import { HandleOtpSendRequestedUseCase } from './application/use-cases/handle-otp-send-requested.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/notification/.env',
            isGlobal: true,
        }),
        DbModule,
        MongoDBModule.forRoot(),
    ],
    controllers: [
        AccountLockedNotifyConsumer,
        OrderConfirmedConsumer,
        OtpSendRequestedConsumer,
        NotificationsController,
    ],
    providers: [
        CreateNotificationUseCase,
        HandleAccountLockedNotifyUseCase,
        HandleOrderConfirmedUseCase,
        HandleOtpSendRequestedUseCase,
        SendNotificationEmailUseCase,
        { provide: INotificationRepositoryPort, useClass: NotificationRepository },
        { provide: INotificationTemplatePort, useClass: OrderConfirmedTemplateAdapter },
        { provide: IEmailSenderPort, useClass: ResendEmailSender },
        { provide: INotificationAuditLogPort, useClass: MongoNotificationAuditLogRepository },
        { provide: IUserNotificationsPort, useClass: MongoUserNotificationsRepository },
    ],
})
export class NotificationModule {}
