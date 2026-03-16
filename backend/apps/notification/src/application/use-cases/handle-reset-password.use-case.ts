import { Injectable } from '@nestjs/common';
import { IResetPasswordRequestEvent } from '@app/shared';
import { IAuthNotificationTemplatePort } from '../../domain/ports/auth-notification-template.port';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';
import { INotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';

@Injectable()
export class HandleResetPasswordUseCase {
    constructor(
        private readonly authNotificationTemplatePort: IAuthNotificationTemplatePort,
        private readonly emailSender: IEmailSenderPort,
        private readonly notificationAuditLogPort: INotificationAuditLogPort,
    ) {}

    async execute(payload: IResetPasswordRequestEvent): Promise<void> {
        const { email } = payload;

        const { title, content } = this.authNotificationTemplatePort.getResetPasswordRequestMessage(payload);
        const timestamp = new Date().toISOString();

        const result = await this.emailSender.send({
            to: email,
            subject: title,
            html: content,
        });

        if (result.success) {
            await this.notificationAuditLogPort.log({
                data: email,
                action: 'RESET_PASSWORD_REQUESTED',
                timestamp,
                details: { email },
            });
        } else {
            await this.notificationAuditLogPort.log({
                data: email,
                action: 'RESET_PASSWORD_REQUESTED_FAILED',
                timestamp,
                details: { email, error: result.error },
            });
        }
    }
}
