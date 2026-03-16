import { IAuthNotificationTemplatePort } from 'apps/notification/src/domain/ports/auth-notification-template.port';
import { Injectable } from '@nestjs/common';
import { INotificationRequest } from 'apps/notification/src/domain/types/notification-request.types';
import { IAccountLockedNotifyEvent, IPasswordChangedEvent, IResetPasswordRequestEvent } from '@app/shared';
import { ACCOUNT_LOCKED_TITLE, accountLockedHtmlTemplate } from './auth-locked-account.template';
import { RESET_PASSWORD_TITLE, resetPasswordHtmlTemplate } from './auth-resent-password.template';
import { PASSWORD_CHANGED_TITLE, passwordChangedHtmlTemplate } from './auth-password-changed.template';

@Injectable()
export class AuthTemplateAdapter implements IAuthNotificationTemplatePort {
    
    getAccountLockedMessage(payload: IAccountLockedNotifyEvent): INotificationRequest {
        const { lockedUntilMinutes } = payload;
        const content = accountLockedHtmlTemplate.replace(/\{\{\s*lockedUntilMinutes\s*\}\}/g, String(lockedUntilMinutes));
        return {
            title: ACCOUNT_LOCKED_TITLE,
            content: content.trim(),
        };
    }

    getResetPasswordRequestMessage(payload: IResetPasswordRequestEvent): INotificationRequest {
        const { linkResetPassword, expiresAt } = payload;
        const data: Record<string, string> = {
            resetPasswordLink: linkResetPassword,
            expiresInMinutes: String(this.getExpiresInMinutes(expiresAt)),
        };
        const content = resetPasswordHtmlTemplate.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? '');
        return {
            title: RESET_PASSWORD_TITLE,
            content: content.trim(),
        };
    }

    getPasswordChangedMessage(_payload: IPasswordChangedEvent): INotificationRequest {
        return {
            title: PASSWORD_CHANGED_TITLE,
            content: passwordChangedHtmlTemplate.trim(),
        };
    }

    private getExpiresInMinutes(expires: Date): number {
        return Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000 / 60));
    }
}
