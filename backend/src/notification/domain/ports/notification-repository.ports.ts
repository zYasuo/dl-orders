import { Notification } from '../entities/notification.entity';
import { ICreateNotification, IUpdateNotification } from '../types/notification-repository.types';

export abstract class INotificationRepositoryPort {
    abstract create(params: ICreateNotification): Promise<Notification | null>;
    abstract update(id: string, data: IUpdateNotification): Promise<Notification | null>;
    abstract delete(id: string): Promise<Notification | null>;
}
