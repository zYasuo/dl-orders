import { INotificationRequest } from '../types/notification-request.types';
import { OtpSendRequestedEvent } from '@app/shared';

export abstract class IOtpNotificationTemplatePort {
    abstract getOtpVerificationMessage(payload: OtpSendRequestedEvent): INotificationRequest;
}