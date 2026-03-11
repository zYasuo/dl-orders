import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DB } from '@app/shared';
import {
    IReservationAuditLogPort,
    TReservationAuditEvent,
} from '../../../../domain/ports/reservation-audit-log.port';

const COLLECTION = 'reservation_audit_log';

@Injectable()
export class MongoReservationAuditLogRepository extends IReservationAuditLogPort {
    private readonly collection = this.db.collection<TReservationAuditEvent & { _id?: unknown }>(COLLECTION);

    constructor(@Inject(MONGODB_DB) private readonly db: Db) {
        super();
    }

    async log(event: TReservationAuditEvent): Promise<void> {
        const { orderId, timestamp, action, details } = event;
        await this.collection.insertOne({ orderId, timestamp, action, details });
    }

    async getByOrderId(orderId: string): Promise<TReservationAuditEvent[]> {
        const cursor = this.collection.find({ orderId }).sort({ timestamp: 1 });
        const items = await cursor.toArray();
        return items.map((item) => ({
            orderId: item.orderId,
            action: item.action,
            timestamp: item.timestamp,
            details: item.details ?? {},
        }));
    }
}
