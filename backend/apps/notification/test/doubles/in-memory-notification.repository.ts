import { INotificationStatus, INotificationType, NotificationEntity } from '../../src/domain/entities/notification.entity';
import { INotificationRepositoryPort } from '../../src/domain/ports/notification-repository.port';
import { ICreateNotification, IUpdateNotification } from '../../src/domain/types/notification-repository.types';

export class InMemoryNotificationRepository extends INotificationRepositoryPort {
    private readonly notifications = new Map<string, NotificationEntity>();

    async create(params: ICreateNotification): Promise<NotificationEntity | null> {
        const notification = NotificationEntity.create({
            title: params.title,
            content: params.content,
            type: params.type as INotificationType,
            sourceEventId: params.sourceEventId,
            recipient: params.recipientEmail,
            userId: params.userId,
        });
        this.notifications.set(notification.id, notification);
        return notification;
    }

    async update(id: string, data: IUpdateNotification): Promise<NotificationEntity | null> {
        const notification = this.notifications.get(id);
        if (!notification) return null;
        const updated = new NotificationEntity(
            notification.id,
            notification.title,
            notification.content,
            notification.type,
            (data.status as INotificationStatus) ?? notification.status,
            notification.sourceEventId,
            notification.recipient,
            notification.userId,
            data.sentAt ?? notification.sentAt,
            notification.createdAt,
            data.updatedAt ?? notification.updatedAt,
        );
        this.notifications.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<NotificationEntity | null> {
        const notification = this.notifications.get(id);
        if (!notification) return null;
        this.notifications.delete(id);
        return notification;
    }
}
