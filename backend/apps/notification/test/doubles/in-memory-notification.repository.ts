import {
  NotificationEntity,
} from '../../src/domain/entities/notification.entity';
import { NotificationRepositoryPort } from '../../src/domain/ports/notification-repository.port';

export class InMemoryNotificationRepository extends NotificationRepositoryPort {
  private readonly notifications = new Map<string, NotificationEntity>();

  async create(entity: NotificationEntity): Promise<NotificationEntity | null> {
    this.notifications.set(entity.id, entity);
    return entity;
  }

  async update(entity: NotificationEntity): Promise<NotificationEntity | null> {
    if (!this.notifications.has(entity.id)) return null;
    this.notifications.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<NotificationEntity | null> {
    const notification = this.notifications.get(id);
    if (!notification) return null;
    this.notifications.delete(id);
    return notification;
  }
}
