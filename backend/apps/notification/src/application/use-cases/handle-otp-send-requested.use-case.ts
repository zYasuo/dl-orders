import { Injectable } from '@nestjs/common';
import { IOtpSendRequestedEvent } from '@app/shared';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';
import { OtpNotificationTemplatePort } from '../../domain/ports/otp-notification-template.port';
import { NotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';

@Injectable()
export class HandleOtpSendRequestedUseCase {
  constructor(
    private readonly otpNotificationTemplatePort: OtpNotificationTemplatePort,
    private readonly emailSender: EmailSenderPort,
    private readonly notificationAuditLogPort: NotificationAuditLogPort,
  ) {}

  async execute(payload: IOtpSendRequestedEvent): Promise<void> {
    const { email, code, expiresInMinutes } = payload;

    const timestamp = new Date().toISOString();
    const { title, content } = this.otpNotificationTemplatePort.getOtpVerificationMessage({
      email,
      code,
      expiresInMinutes,
    });

    const result = await this.emailSender.send({
      to: email,
      subject: title,
      html: content,
    });

    if (result.success) {
      await this.notificationAuditLogPort.log({
        data: email,
        action: 'OTP_SENT',
        timestamp,
        details: { email, code, expiresInMinutes },
      });
    } else {
      await this.notificationAuditLogPort.log({
        data: email,
        action: 'OTP_SENT_FAILED',
        timestamp,
        details: { email, error: result.error },
      });
    }
  }
}
