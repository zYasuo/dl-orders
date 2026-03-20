import { IOrderConfirmedEvent } from '@app/shared';
import { INotificationRequest } from '../types/notification-request.types';

export abstract class OrderNotificationTemplatePort {
  abstract getOrderConfirmedMessage(payload: IOrderConfirmedEvent): INotificationRequest;
}
