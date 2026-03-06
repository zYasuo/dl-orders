import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '.prisma/auth-client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        const adapter = new PrismaPg({
            connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
