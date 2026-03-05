import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import {
    Notification,
    INotificationStatus,
    INotificationType,
} from '../../../domain/entities/notification.entity';
import { INotificationRepositoryPort } from '../../../domain/ports/notification-repository.port';
import { ICreateNotification, IUpdateNotification } from '../../../domain/types/notification-repository.types';

@Injectable()
export class NotificationRepository extends INotificationRepositoryPort {
    constructor(private readonly db: DbService) { super(); }

    async create(params: ICreateNotification): Promise<Notification | null> {
        const { title, content, type, sourceEventId, recipient } = params;
        const row = await this.db.notification.create({
            data: {
                title,
                content,
                type: type as 'EMAIL',
                sourceEventId,
                recipient,
            },
        });
        return new Notification(
            row.id, row.title, row.content,
            row.type as INotificationType, row.status as INotificationStatus,
            row.sourceEventId, row.recipient, row.sentAt,
            row.createdAt, row.updatedAt,
        );
    }

    async update(id: string, data: IUpdateNotification): Promise<Notification | null> {
        const row = await this.db.notification.update({
            where: { id },
            data: {
                ...(data.status != null && { status: data.status as 'PENDING' | 'SENT' | 'FAILED' }),
                ...(data.sentAt != null && { sentAt: data.sentAt }),
                ...(data.updatedAt != null && { updatedAt: data.updatedAt }),
            },
        });
        return new Notification(
            row.id, row.title, row.content,
            row.type as INotificationType, row.status as INotificationStatus,
            row.sourceEventId, row.recipient, row.sentAt,
            row.createdAt, row.updatedAt,
        );
    }

    async delete(id: string): Promise<Notification | null> {
        const row = await this.db.notification.delete({ where: { id } });
        return new Notification(
            row.id, row.title, row.content,
            row.type as INotificationType, row.status as INotificationStatus,
            row.sourceEventId, row.recipient, row.sentAt,
            row.createdAt, row.updatedAt,
        );
    }
}
