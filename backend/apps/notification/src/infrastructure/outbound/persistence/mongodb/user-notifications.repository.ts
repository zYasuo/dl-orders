import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DB } from '@app/shared';
import {
  UserNotificationsPort,
  TUserNotificationItem,
} from '../../../../domain/ports/user-notifications.port';

const COLLECTION = 'user_notifications';

@Injectable()
export class MongoUserNotificationsRepository extends UserNotificationsPort {
  private readonly collection = this.db.collection<TUserNotificationItem & { _id?: unknown }>(
    COLLECTION,
  );

  constructor(@Inject(MONGODB_DB) private readonly db: Db) {
    super();
  }

  async add(item: TUserNotificationItem): Promise<void> {
    await this.collection.insertOne({
      userId: item.userId,
      timestamp: item.timestamp,
      notificationId: item.notificationId,
      orderId: item.orderId,
      title: item.title,
      content: item.content,
      read: item.read,
    });
  }

  async getByUserId(userId: string, limit = 20): Promise<TUserNotificationItem[]> {
    const cursor = this.collection.find({ userId }).sort({ timestamp: -1 }).limit(limit);
    const items = await cursor.toArray();
    return items.map((item) => ({
      userId: item.userId,
      timestamp: item.timestamp,
      notificationId: item.notificationId,
      orderId: item.orderId,
      title: item.title,
      content: item.content,
      read: item.read ?? false,
    }));
  }
}
