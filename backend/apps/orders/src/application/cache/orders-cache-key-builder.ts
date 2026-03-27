import { Injectable } from '@nestjs/common';
import { CachePort } from '@app/shared';

@Injectable()
export class OrdersCacheKeyBuilder {
  private readonly versionKey = 'orders:all:version';

  constructor(private readonly cache: CachePort) {}

  async buildListKey(
    page: number,
    limit: number,
    scope: 'all' | { recipientEmail: string } = 'all',
  ): Promise<string> {
    const version = (await this.cache.get(this.versionKey)) ?? '1';
    const scopeKey =
      scope === 'all' ? 'all' : `u:${scope.recipientEmail}`;
    return `orders:${scopeKey}:v${version}:page:${page}:limit:${limit}`;
  }

  async bumpVersion(): Promise<void> {
    await this.cache.incr(this.versionKey);
  }
}
