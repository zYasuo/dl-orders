import { INotificationRequest } from '../types/notification-request.types';
import { IOtpSendRequestedEvent } from '@app/shared';

export abstract class IOtpNotificationTemplatePort {
    abstract getOtpVerificationMessage(payload: IOtpSendRequestedEvent): INotificationRequest;
}
