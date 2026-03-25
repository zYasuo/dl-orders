import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CachePort } from '../../ports/cache';

const KEY_PREFIX = 'cache:';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy, CachePort {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.getOrThrow<string>('REDIS_URL'));
  }

  onModuleInit(): void {
    this.redis.on('ready', () => {
      this.logger.log('Redis (cache) ready');
    });
    this.redis.on('error', (err) => {
      this.logger.error(err.message, err.stack);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private ns(key: string): string {
    return `${KEY_PREFIX}${key}`;
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(this.ns(key));
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.set(this.ns(key), value, 'EX', ttl);
  }

  async setIfNotExists(key: string, value: string, ttl: number): Promise<boolean> {
    const result = await this.redis.set(this.ns(key), value, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.ns(key));
  }

  async delIfEquals(key: string, value: string): Promise<boolean> {
    const result = await this.redis.eval(
      "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
      1,
      this.ns(key),
      value,
    );
    return result === 1;
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(this.ns(key))) === 1;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.logger.warn(`Invalid JSON in cache for key: ${key}`);
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(this.ns(key));
  }
}
