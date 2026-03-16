import { IAuthNotificationTemplatePort } from 'apps/notification/src/domain/ports/auth-notification-template.port';
import { Injectable } from '@nestjs/common';
import { INotificationRequest } from 'apps/notification/src/domain/types/notification-request.types';
import { AccountLockedNotifyEvent, IResetPasswordRequestEvent } from '@app/shared';
import { ACCOUNT_LOCKED_TITLE, accountLockedHtmlTemplate } from './auth-locked-account.template';
import { RESET_PASSWORD_TITLE, resetPasswordHtmlTemplate } from './auth-resent-password.template';

@Injectable()
export class AuthTemplateAdapter implements IAuthNotificationTemplatePort {
    
    getAccountLockedMessage(payload: AccountLockedNotifyEvent): INotificationRequest {
        const { lockedUntilMinutes } = payload;
        const content = accountLockedHtmlTemplate.replace(/\{\{\s*lockedUntilMinutes\s*\}\}/g, String(lockedUntilMinutes));
        return {
            title: ACCOUNT_LOCKED_TITLE,
            content: content.trim(),
        };
    }

    getResetPasswordRequestMessage(payload: IResetPasswordRequestEvent): INotificationRequest {
        const { email, linkResetPassword, expiresAt } = payload;

        const content = this.replacePlaceholders(
            resetPasswordHtmlTemplate,
            {
                email,
                linkResetPassword,
            },
            expiresAt,
        );

        return {
            title: RESET_PASSWORD_TITLE,
            content: content.trim(),
        };
    }

    private replacePlaceholders(template: string, data: Record<string, string>, expires: Date): string {
        const expiresInMinutes = this.getExpiresInMinutes(expires);
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? '').replace('{{ expiresInMinutes }}', expiresInMinutes.toString());
    }

    private getExpiresInMinutes(expires: Date): number {
        return Math.floor((expires.getTime() - Date.now()) / 1000 / 60);
    }
}
