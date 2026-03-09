import { INotificationStatus, INotificationType } from '../entities/notification.entity';

export interface ICreateNotification {
    title: string;
    content: string;
    type: INotificationType;
    sourceEventId: string;
    recipientEmail: string;
    userId: string;
    productName: string;
    productDescription: string;
    totalPrice: number;
    quantity: number;
}

export interface IUpdateNotification {
    status?: INotificationStatus;
    sentAt?: Date | null;
    updatedAt?: Date;
}
