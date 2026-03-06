import { Injectable, Logger } from '@nestjs/common';
import { INotificationStatus, Notification } from '../../domain/entities/notification.entity';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';
import { INotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';
import { INotificationRepositoryPort } from '../../domain/ports/notification-repository.port';
import { IUserNotificationsPort } from '../../domain/ports/user-notifications.port';

@Injectable()
export class SendNotificationEmailUseCase {
    private readonly logger = new Logger(SendNotificationEmailUseCase.name);

    constructor(
        private readonly emailSenderPort: IEmailSenderPort,
        private readonly notificationRepositoryPort: INotificationRepositoryPort,
        private readonly notificationAuditLogPort: INotificationAuditLogPort,
        private readonly userNotificationsPort: IUserNotificationsPort,
    ) {}

    async execute(notification: Notification): Promise<void> {
        const { recipient, title, content, sourceEventId } = notification;
        const orderId = sourceEventId;
        const timestamp = new Date().toISOString();

        const result = await this.emailSenderPort.send({ to: recipient, subject: title, html: content });

        const now = new Date();

        if (result.success) {
            await this.notificationAuditLogPort.log({
                orderId,
                action: 'NOTIFICATION_SENT',
                timestamp,
                details: { notificationId: notification.id, recipient },
            });

            try {
                await this.userNotificationsPort.add({
                    userId: recipient,
                    timestamp,
                    notificationId: notification.id,
                    orderId,
                    title,
                    content,
                    read: false,
                });
            } catch (err) {
                this.logger.warn('Failed to add user notification', {
                    notificationId: notification.id,
                    recipient,
                    err,
                });
            }

            await this.notificationRepositoryPort.update(notification.id, {
                status: INotificationStatus.SENT,
                sentAt: now,
                updatedAt: now,
            });
        } else {
            await this.notificationAuditLogPort.log({
                orderId,
                action: 'NOTIFICATION_FAILED',
                timestamp,
                details: { notificationId: notification.id, recipient, error: result.error },
            });

            await this.notificationRepositoryPort.update(notification.id, {
                status: INotificationStatus.FAILED,
                updatedAt: now,
            });
        }
    }
}
