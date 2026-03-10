import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis | null = null;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        const url = this.configService.getOrThrow<string>('REDIS_URL');
        this.client = new Redis(url);
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }

    getClient(): Redis {
        if (!this.client) {
            throw new Error('Redis client not initialized');
        }
        return this.client;
    }
}
