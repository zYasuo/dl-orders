import { INotificationRequest } from '../types/notification-request.types';
import { IOtpSendRequestedEvent } from '@app/shared';

export abstract class OtpNotificationTemplatePort {
  abstract getOtpVerificationMessage(payload: IOtpSendRequestedEvent): INotificationRequest;
}
