import { INotificationStatus, INotificationType, Notification } from '../../src/domain/entities/notification.entity';
import { INotificationRepositoryPort } from '../../src/domain/ports/notification-repository.port';
import { ICreateNotification, IUpdateNotification } from '../../src/domain/types/notification-repository.types';

export class InMemoryNotificationRepository extends INotificationRepositoryPort {
    private readonly notifications = new Map<string, Notification>();

    async create(params: ICreateNotification): Promise<Notification | null> {
        const {
            title,
            content,
            type,
            sourceEventId,
            recipientEmail,
            userId,
        } = params;
        const now = new Date();
        const notification = new Notification(
            crypto.randomUUID(),
            title,
            content,
            type as INotificationType,
            INotificationStatus.PENDING,
            sourceEventId,
            recipientEmail,
            userId,
            null,
            now,
            now,
        );
        this.notifications.set(notification.id, notification);
        return notification;
    }

    async update(id: string, data: IUpdateNotification): Promise<Notification | null> {
        const notification = this.notifications.get(id);
        if (!notification) return null;
        const updated = new Notification(
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

    async delete(id: string): Promise<Notification | null> {
        const notification = this.notifications.get(id);
        if (!notification) return null;
        this.notifications.delete(id);
        return notification;
    }
}
