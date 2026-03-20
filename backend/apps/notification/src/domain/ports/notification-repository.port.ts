import { NotificationEntity } from '../entities/notification.entity';

export abstract class NotificationRepositoryPort {
  abstract create(entity: NotificationEntity): Promise<NotificationEntity | null>;
  abstract update(entity: NotificationEntity): Promise<NotificationEntity | null>;
  abstract delete(id: string): Promise<NotificationEntity | null>;
}
