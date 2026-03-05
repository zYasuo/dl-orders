import { Injectable } from '@nestjs/common';
import { INotificationRepositoryPort } from 'src/notification/domain/ports/notification-repository.ports';
import { IEmailSenderPort } from 'src/notification/domain/ports/email-sender.ports';
import { Notification, INotificationStatus } from '../../domain/entities/notification.entity';

@Injectable()
export class SendNotificationEmailUseCase {
    constructor(
        private readonly emailSenderPort: IEmailSenderPort,
        private readonly notificationRepositoryPort: INotificationRepositoryPort,
    ) {}

    async execute(notification: Notification): Promise<void> {
        const result = await this.emailSenderPort.send({
            to: notification.recipient,
            subject: notification.title,
            html: notification.content,
        });

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
