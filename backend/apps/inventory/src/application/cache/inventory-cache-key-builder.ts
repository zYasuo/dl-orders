import { Injectable } from '@nestjs/common';
import { CachePort } from '@app/shared';

@Injectable()
export class InventoryCacheKeyBuilder {
  private readonly versionKey = 'inventories:all:version';

  constructor(private readonly cache: CachePort) {}

  async buildListKey(page: number, limit: number): Promise<string> {
    const version = (await this.cache.get(this.versionKey)) ?? '1';
    return `inventories:all:v${version}:page:${page}:limit:${limit}`;
  }

  async bumpVersion(): Promise<void> {
    await this.cache.incr(this.versionKey);
  }
}
