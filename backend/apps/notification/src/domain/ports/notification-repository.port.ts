import { NotificationEntity } from '../entities/notification.entity';
import { ICreateNotification, IUpdateNotification } from '../types/notification-repository.types';

export abstract class INotificationRepositoryPort {
    abstract create(params: ICreateNotification): Promise<NotificationEntity | null>;
    abstract update(id: string, data: IUpdateNotification): Promise<NotificationEntity | null>;
    abstract delete(id: string): Promise<NotificationEntity | null>;
}
