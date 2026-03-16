import { Injectable } from '@nestjs/common';
import { IPasswordChangedEvent } from '@app/shared';
import { IAuthNotificationTemplatePort } from '../../domain/ports/auth-notification-template.port';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';
import { INotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';

@Injectable()
export class HandlePasswordChangedUseCase {
    constructor(
        private readonly authNotificationTemplatePort: IAuthNotificationTemplatePort,
        private readonly emailSender: IEmailSenderPort,
        private readonly notificationAuditLogPort: INotificationAuditLogPort,
    ) {}

    async execute(payload: IPasswordChangedEvent): Promise<void> {
        const { email } = payload;

        const { title, content } = this.authNotificationTemplatePort.getPasswordChangedMessage(payload);
        const timestamp = new Date().toISOString();

        const result = await this.emailSender.send({
            to: email,
            subject: title,
            html: content,
        });

        if (result.success) {
            await this.notificationAuditLogPort.log({
                data: email,
                action: 'PASSWORD_CHANGED',
                timestamp,
                details: { email },
            });
        } else {
            await this.notificationAuditLogPort.log({
                data: email,
                action: 'PASSWORD_CHANGED_FAILED',
                timestamp,
                details: { email, error: result.error },
            });
        }
    }
}
