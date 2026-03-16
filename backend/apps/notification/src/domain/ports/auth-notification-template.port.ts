import { IAccountLockedNotifyEvent, IResetPasswordRequestEvent } from '@app/shared';
import { INotificationRequest } from '../types/notification-request.types';

export abstract class IAuthNotificationTemplatePort {
    abstract getResetPasswordRequestMessage(payload: IResetPasswordRequestEvent): INotificationRequest;
    abstract getAccountLockedMessage(payload: IAccountLockedNotifyEvent): INotificationRequest;
}