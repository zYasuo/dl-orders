import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';
import { REDIS_KEY_PREFIX } from '../../../redis/constants/redis.constants';
import { LowStockNotificationDeduperPort } from '../../../../domain/ports/inventory-low-stock-notification-deduper.port';

const LOW_STOCK_DEDUP_TTL_SECONDS = 10 * 60;
const LOW_STOCK_DEDUP_KEY_PREFIX = `${REDIS_KEY_PREFIX}low-stock:sent:`;

@Injectable()
export class RedisLowStockNotificationDeduperAdapter
  extends LowStockNotificationDeduperPort
{
  constructor(private readonly redis: RedisService) {
    super();
  }

  async shouldNotify(inventoryId: string): Promise<boolean> {
    const client = this.redis.getClient();
    const key = LOW_STOCK_DEDUP_KEY_PREFIX + inventoryId;

    const result = await client.set(
      key,
      '1',
      'EX',
      LOW_STOCK_DEDUP_TTL_SECONDS,
      'NX',
    );

    return result !== null;
  }
}

