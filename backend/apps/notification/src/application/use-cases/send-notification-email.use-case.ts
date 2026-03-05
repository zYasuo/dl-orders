import { Injectable } from '@nestjs/common';
import { INotificationStatus, Notification } from '../../domain/entities/notification.entity';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';
import { INotificationRepositoryPort } from '../../domain/ports/notification-repository.port';

@Injectable()
export class SendNotificationEmailUseCase {
    constructor(
        private readonly emailSenderPort: IEmailSenderPort,
        private readonly notificationRepositoryPort: INotificationRepositoryPort,
    ) {}

    async execute(notification: Notification): Promise<void> {
        const { recipient, title, content } = notification;

        const result = await this.emailSenderPort.send({ to: recipient, subject: title, html: content });

        const now = new Date();

        if (result.success) {
            await this.notificationRepositoryPort.update(notification.id, {
                status: INotificationStatus.SENT,
                sentAt: now,
                updatedAt: now,
            });
        } else {
            await this.notificationRepositoryPort.update(notification.id, {
                status: INotificationStatus.FAILED,
                updatedAt: now,
            });
        }
    }
}
