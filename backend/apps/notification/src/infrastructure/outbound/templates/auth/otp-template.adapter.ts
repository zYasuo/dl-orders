import { Injectable } from '@nestjs/common';
import { INotificationRequest } from 'apps/notification/src/domain/types/notification-request.types';
import { OTP_VERIFICATION_TITLE, otpVerificationHtmlTemplate } from './otp-verification.template';
import { IOtpSendRequestedEvent } from '@app/shared';
import { OtpNotificationTemplatePort } from 'apps/notification/src/domain/ports/otp-notification-template.port';

@Injectable()
export class OtpTemplateAdapter implements OtpNotificationTemplatePort {
  getOtpVerificationMessage(payload: IOtpSendRequestedEvent): INotificationRequest {
    const { code, expiresInMinutes } = payload;

    const content = this.replacePlaceholders(otpVerificationHtmlTemplate, code, expiresInMinutes);

    return {
      title: OTP_VERIFICATION_TITLE,
      content: content.trim(),
    };
  }

  private replacePlaceholders(template: string, code: string, expiresInMinutes: number): string {
    return template
      .replace('{{ code }}', code)
      .replace('{{ expiresInMinutes }}', expiresInMinutes.toString());
  }
}
