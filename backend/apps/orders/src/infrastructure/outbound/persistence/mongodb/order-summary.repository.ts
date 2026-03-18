import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DB } from '@app/shared';
import { IOrderSummaryPort, TOrderSummary } from '../../../../domain/ports/order-summary.port';

const COLLECTION = 'order_summaries';

@Injectable()
export class MongoOrderSummaryRepository extends IOrderSummaryPort {
  private readonly collection = this.db.collection<TOrderSummary>(COLLECTION);

  constructor(@Inject(MONGODB_DB) private readonly db: Db) {
    super();
  }

  async put(summary: TOrderSummary): Promise<void> {
    await this.collection.updateOne(
      { orderId: summary.orderId },
      { $set: summary },
      { upsert: true },
    );
  }

  async getByOrderId(orderId: string): Promise<TOrderSummary | null> {
    const doc = await this.collection.findOne({ orderId });
    return doc ?? null;
  }
}
