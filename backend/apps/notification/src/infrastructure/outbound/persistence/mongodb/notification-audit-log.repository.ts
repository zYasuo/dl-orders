import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DB } from '@app/shared';
import {
  NotificationAuditLogPort,
  TNotificationAuditEvent,
} from '../../../../domain/ports/notification-audit-log.port';

const COLLECTION = 'notification_audit_log';

@Injectable()
export class MongoNotificationAuditLogRepository extends NotificationAuditLogPort {
  private readonly collection = this.db.collection<TNotificationAuditEvent & { _id?: unknown }>(
    COLLECTION,
  );

  constructor(@Inject(MONGODB_DB) private readonly db: Db) {
    super();
  }

  async log(event: TNotificationAuditEvent): Promise<void> {
    const { data, timestamp, action, details } = event;
    await this.collection.insertOne({ data, timestamp, action, details });
  }

  async getByData(data: string): Promise<TNotificationAuditEvent[]> {
    const cursor = this.collection.find({ data }).sort({ timestamp: 1 });
    const items = await cursor.toArray();

    return items.map((item) => ({
      data: item.data,
      action: item.action,
      timestamp: item.timestamp,
      details: item.details ?? {},
    }));
  }
}
