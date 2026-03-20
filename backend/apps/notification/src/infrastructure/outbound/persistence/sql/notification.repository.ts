import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import {
  NotificationEntity,
  INotificationStatus,
  INotificationType,
} from '../../../../domain/entities/notification.entity';
import { NotificationRepositoryPort } from '../../../../domain/ports/notification-repository.port';

@Injectable()
export class NotificationRepository extends NotificationRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: NotificationEntity): Promise<NotificationEntity | null> {
    const row = await this.db.notification.create({
      data: {
        id: entity.id,
        title: entity.title,
        content: entity.content,
        type: entity.type as 'EMAIL',
        sourceEventId: entity.sourceEventId,
        recipientEmail: entity.recipient,
        userId: entity.userId,
        productName: entity.productName,
        productDescription: entity.productDescription,
        totalPrice: entity.totalPrice,
        quantity: entity.quantity,
        sentAt: entity.sentAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
    return new NotificationEntity(
      row.id,
      row.title,
      row.content,
      row.type as INotificationType,
      row.status as INotificationStatus,
      row.sourceEventId,
      row.recipientEmail,
      row.userId,
      row.productName,
      row.productDescription,
      row.totalPrice,
      row.quantity,
      row.sentAt,
      row.createdAt,
      row.updatedAt,
    );
  }

  async update(entity: NotificationEntity): Promise<NotificationEntity | null> {
    const row = await this.db.notification.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        content: entity.content,
        type: entity.type as 'EMAIL',
        status: entity.status as 'PENDING' | 'SENT' | 'FAILED',
        sourceEventId: entity.sourceEventId,
        recipientEmail: entity.recipient,
        userId: entity.userId,
        productName: entity.productName,
        productDescription: entity.productDescription,
        totalPrice: entity.totalPrice,
        quantity: entity.quantity,
        sentAt: entity.sentAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
    return new NotificationEntity(
      row.id,
      row.title,
      row.content,
      row.type as INotificationType,
      row.status as INotificationStatus,
      row.sourceEventId,
      row.recipientEmail,
      row.userId,
      row.productName,
      row.productDescription,
      row.totalPrice,
      row.quantity,
      row.sentAt,
      row.createdAt,
      row.updatedAt,
    );
  }

  async delete(id: string): Promise<NotificationEntity | null> {
    const row = await this.db.notification.delete({ where: { id } });
    return new NotificationEntity(
      row.id,
      row.title,
      row.content,
      row.type as INotificationType,
      row.status as INotificationStatus,
      row.sourceEventId,
      row.recipientEmail,
      row.userId,
      row.productName,
      row.productDescription,
      row.totalPrice,
      row.quantity,
      row.sentAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
