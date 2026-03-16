import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from '@app/shared';
import { DbModule } from './infrastructure/db/db.module';
import { IEmailSenderPort } from './domain/ports/email-sender.port';
import { INotificationAuditLogPort } from './domain/ports/notification-audit-log.port';
import { INotificationRepositoryPort } from './domain/ports/notification-repository.port';
import { IOrderNotificationTemplatePort } from './domain/ports/order-notification-template.port';
import { IUserNotificationsPort } from './domain/ports/user-notifications.port';
import { NotificationsController } from './infrastructure/inbound/http/notifications.controller';
import { AccountLockedNotifyConsumer } from './infrastructure/inbound/messaging/account-locked-notify.consumer';
import { OrderConfirmedConsumer } from './infrastructure/inbound/messaging/order-confirmed.consumer';
import { OtpSendRequestedConsumer } from './infrastructure/inbound/messaging/otp-send-requested.consumer';
import { ResetPasswordLinkRequestedConsumer } from './infrastructure/inbound/messaging/reset-password-link-requested.consumer';
import { PasswordChangedConsumer } from './infrastructure/inbound/messaging/password-changed.consumer';
import { ResendEmailSender } from './infrastructure/outbound/email/resend-email.sender';
import { MongoNotificationAuditLogRepository } from './infrastructure/outbound/persistence/mongodb/notification-audit-log.repository';
import { MongoUserNotificationsRepository } from './infrastructure/outbound/persistence/mongodb/user-notifications.repository';
import { NotificationRepository } from './infrastructure/outbound/persistence/sql/notification.repository';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { HandleOrderConfirmedUseCase } from './application/use-cases/handle-order-confirmed.use-case';
import { HandleAccountLockedNotifyUseCase } from './application/use-cases/handle-account-locked-notify.use-case';
import { HandleOtpSendRequestedUseCase } from './application/use-cases/handle-otp-send-requested.use-case';
import { HandleResetPasswordUseCase } from './application/use-cases/handle-reset-password.use-case';
import { HandlePasswordChangedUseCase } from './application/use-cases/handle-password-changed.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';
import { OrderTemplateAdapter } from './infrastructure/outbound/templates/order/order-template.adapter';
import { AuthTemplateAdapter } from './infrastructure/outbound/templates/auth/auth-template.adapter';
import { IAuthNotificationTemplatePort } from './domain/ports/auth-notification-template.port';
import { IOtpNotificationTemplatePort } from './domain/ports/otp-notification-template.port';
import { OtpTemplateAdapter } from './infrastructure/outbound/templates/auth/otp-template.adapter';
    
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
        ResetPasswordLinkRequestedConsumer,
        PasswordChangedConsumer,
        NotificationsController,
    ],
    providers: [
        CreateNotificationUseCase,
        HandleAccountLockedNotifyUseCase,
        HandleOrderConfirmedUseCase,
        HandleOtpSendRequestedUseCase,
        HandleResetPasswordUseCase,
        HandlePasswordChangedUseCase,
        SendNotificationEmailUseCase,
        { provide: INotificationRepositoryPort, useClass: NotificationRepository },
        { provide: IOrderNotificationTemplatePort, useClass: OrderTemplateAdapter },
        { provide: IAuthNotificationTemplatePort, useClass: AuthTemplateAdapter },
        { provide: IOtpNotificationTemplatePort, useClass: OtpTemplateAdapter },
        { provide: IEmailSenderPort, useClass: ResendEmailSender },
        { provide: INotificationAuditLogPort, useClass: MongoNotificationAuditLogRepository },
        { provide: IUserNotificationsPort, useClass: MongoUserNotificationsRepository },
    ],
})
export class NotificationModule {}
