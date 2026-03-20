import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import {
  NotificationEntity,
  INotificationStatus,
  INotificationType,
} from '../../../../domain/entities/notification.entity';
import { NotificationRepositoryPort } from '../../../../domain/ports/notification-repository.port';
import {
  ICreateNotification,
  IUpdateNotification,
} from '../../../../domain/types/notification-repository.types';

@Injectable()
export class NotificationRepository extends NotificationRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(params: ICreateNotification): Promise<NotificationEntity | null> {
    const {
      title,
      content,
      type,
      sourceEventId,
      recipientEmail,
      userId,
      productName,
      productDescription,
      totalPrice,
      quantity,
    } = params;
    const row = await this.db.notification.create({
      data: {
        title,
        content,
        type: type as 'EMAIL',
        sourceEventId,
        recipientEmail,
        userId,
        productName,
        productDescription,
        totalPrice,
        quantity,
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
      row.sentAt,
      row.createdAt,
      row.updatedAt,
    );
  }

  async update(id: string, data: IUpdateNotification): Promise<NotificationEntity | null> {
    const row = await this.db.notification.update({
      where: { id },
      data: {
        ...(data.status != null && { status: data.status as 'PENDING' | 'SENT' | 'FAILED' }),
        ...(data.sentAt != null && { sentAt: data.sentAt }),
        ...(data.updatedAt != null && { updatedAt: data.updatedAt }),
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
      row.sentAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
