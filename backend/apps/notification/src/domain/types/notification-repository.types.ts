import { INotificationStatus, INotificationType } from '../entities/notification.entity';

export interface ICreateNotification {
    title: string;
    content: string;
    type: INotificationType;
    sourceEventId: string;
    recipient: string;
}

export interface IUpdateNotification {
    status?: INotificationStatus;
    sentAt?: Date | null;
    updatedAt?: Date;
}
