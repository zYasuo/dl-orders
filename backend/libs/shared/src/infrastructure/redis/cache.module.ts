import { Module } from '@nestjs/common';
import { CachePort } from '../../ports/cache';
import { RedisCacheService } from './redis-cache.service';

@Module({
  providers: [{ provide: CachePort, useClass: RedisCacheService }],
  exports: [CachePort],
})
export class CacheModule {}
