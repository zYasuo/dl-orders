import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';
import { readAdapter } from './adapters/db-read.adapter';
import { writeAdapter } from './adapters/db-write.adapter';

const writeClient = new PrismaClient({ adapter: writeAdapter });
const readReplicaClient = new PrismaClient({ adapter: readAdapter });

const extendedClient = writeClient.$extends(readReplicas({ replicas: [readReplicaClient] }));

export type ExtendedPrismaClient = typeof extendedClient;

export interface DbService extends ExtendedPrismaClient {}

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
    constructor() {
        Object.assign(this, extendedClient);
    }

    async onModuleInit() {
        await writeClient.$connect();
        await readReplicaClient.$connect();
    }

    async onModuleDestroy() {
        await writeClient.$disconnect();
        await readReplicaClient.$disconnect();
    }
}
