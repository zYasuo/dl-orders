import { IInventoryLowStockEvent } from '@app/shared';
import { INotificationRequest } from '../types/notification-request.types';

export abstract class IInventoryNotificationTemplatePort {
  abstract getInventoryLowStockMessage(payload: IInventoryLowStockEvent): INotificationRequest;
}
