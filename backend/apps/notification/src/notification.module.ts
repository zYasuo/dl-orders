import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtAuthGuard, MongoDBModule, ServiceOrJwtAuthGuard } from '@app/shared';
import { DbModule } from './infrastructure/db/db.module';
import { EmailSenderPort } from './domain/ports/email-sender.port';
import { NotificationAuditLogPort } from './domain/ports/notification-audit-log.port';
import { NotificationRepositoryPort } from './domain/ports/notification-repository.port';
import { OrderNotificationTemplatePort } from './domain/ports/order-notification-template.port';
import { UserNotificationsPort } from './domain/ports/user-notifications.port';
import { NotificationsController } from './infrastructure/inbound/http/notifications.controller';
import { CartAbandonmentInternalController } from './infrastructure/inbound/http/cart-abandonment-internal.controller';
import { CartAbandonmentCronService } from './infrastructure/inbound/http/cart-abandonment-cron.service';
import { AccountLockedNotifyConsumer } from './infrastructure/inbound/messaging/account-locked-notify.consumer';
import { OrderConfirmedConsumer } from './infrastructure/inbound/messaging/order-confirmed.consumer';
import { OtpSendRequestedConsumer } from './infrastructure/inbound/messaging/otp-send-requested.consumer';
import { ResetPasswordLinkRequestedConsumer } from './infrastructure/inbound/messaging/reset-password-link-requested.consumer';
import { PasswordChangedConsumer } from './infrastructure/inbound/messaging/password-changed.consumer';
import { InvetoryLowStockConsumer } from './infrastructure/inbound/messaging/invetory-low-stock.consumer';
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
import { HandleInventoryLowStockUseCase } from './application/use-cases/handle-invetory-low-stock.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';
import { OrderTemplateAdapter } from './infrastructure/outbound/templates/order/order-template.adapter';
import { AuthTemplateAdapter } from './infrastructure/outbound/templates/auth/auth-template.adapter';
import { AuthNotificationTemplatePort } from './domain/ports/auth-notification-template.port';
import { OtpNotificationTemplatePort } from './domain/ports/otp-notification-template.port';
import { OtpTemplateAdapter } from './infrastructure/outbound/templates/auth/otp-template.adapter';
import { InventoryNotificationTemplatePort } from './domain/ports/inventory-notification-template.port';
import { InventoryLowStockTemplateAdapter } from './infrastructure/outbound/templates/inventory/inventory-low-stock-template.adapter';
import { CartAbandonmentScheduleRepository } from './infrastructure/outbound/persistence/sql/cart-abandonment-schedule.repository';
import { CartAbandonmentScheduleRepositoryPort } from './domain/ports/cart-abandonment-schedule-repository.port';
import { CartAbandonmentEmailTemplatePort } from './domain/ports/cart-abandonment-email-template.port';
import { CartAbandonmentTemplateAdapter } from './infrastructure/outbound/templates/cart/cart-abandonment-template.adapter';
import { UpsertCartAbandonmentScheduleUseCase } from './application/use-cases/upsert-cart-abandonment-schedule.use-case';
import { CancelCartAbandonmentScheduleUseCase } from './application/use-cases/cancel-cart-abandonment-schedule.use-case';
import { ProcessDueCartAbandonmentRemindersUseCase } from './application/use-cases/process-due-cart-abandonment-reminders.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/notification/.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DbModule,
    MongoDBModule.forRoot(),
  ],
  controllers: [
    AccountLockedNotifyConsumer,
    OrderConfirmedConsumer,
    OtpSendRequestedConsumer,
    ResetPasswordLinkRequestedConsumer,
    PasswordChangedConsumer,
    InvetoryLowStockConsumer,
    NotificationsController,
    CartAbandonmentInternalController,
  ],
  providers: [
    JwtAuthGuard,
    ServiceOrJwtAuthGuard,
    CartAbandonmentCronService,
    CreateNotificationUseCase,
    HandleAccountLockedNotifyUseCase,
    HandleInventoryLowStockUseCase,
    HandleOrderConfirmedUseCase,
    HandleOtpSendRequestedUseCase,
    HandleResetPasswordUseCase,
    HandlePasswordChangedUseCase,
    SendNotificationEmailUseCase,
    { provide: NotificationRepositoryPort, useClass: NotificationRepository },
    { provide: OrderNotificationTemplatePort, useClass: OrderTemplateAdapter },
    { provide: AuthNotificationTemplatePort, useClass: AuthTemplateAdapter },
    { provide: OtpNotificationTemplatePort, useClass: OtpTemplateAdapter },
    { provide: InventoryNotificationTemplatePort, useClass: InventoryLowStockTemplateAdapter },
    { provide: EmailSenderPort, useClass: ResendEmailSender },
    { provide: NotificationAuditLogPort, useClass: MongoNotificationAuditLogRepository },
    { provide: UserNotificationsPort, useClass: MongoUserNotificationsRepository },
    { provide: CartAbandonmentScheduleRepositoryPort, useClass: CartAbandonmentScheduleRepository },
    { provide: CartAbandonmentEmailTemplatePort, useClass: CartAbandonmentTemplateAdapter },
    UpsertCartAbandonmentScheduleUseCase,
    CancelCartAbandonmentScheduleUseCase,
    ProcessDueCartAbandonmentRemindersUseCase,
  ],
})
export class NotificationModule {}
