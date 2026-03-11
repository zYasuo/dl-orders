import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from '@app/shared';
import { CreateInventoryUseCase } from './application/use-cases/create-inventory.use-case';
import { FindAllInventoryUseCase } from './application/use-cases/find-all-invetory.use-case';
import { HandleOrderCreationRequestedUseCase } from './application/use-cases/handle-order-creation-requested.use-case';
import { IInventoryEventsPublisherPort } from './domain/ports/inventory-events-publisher.port';
import { IInventoryListCachePort } from './domain/ports/inventory-list-cache.port';
import { IInventoryRepositoryPort } from './domain/ports/inventory-repository.port';
import { IReservationAuditLogPort } from './domain/ports/reservation-audit-log.port';
import { DbModule } from './infrastructure/db/db.module';
import { InventoryController } from './infrastructure/inbound/http/inventory.controller';
import { OrderCreationRequestedConsumer } from './infrastructure/inbound/messaging/order-creation-requested.consumer';
import { InventoryRabbitMqPublisher } from './infrastructure/outbound/messaging/inventory-events.publisher';
import { MongoReservationAuditLogRepository } from './infrastructure/outbound/persistence/mongodb/reservation-audit-log.repository';
import { RedisInventoryListCacheAdapter } from './infrastructure/outbound/persistence/redis/redis-inventory-list-cache.adapter';
import { InventoryRepository } from './infrastructure/outbound/persistence/sql/inventory.repository';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/inventory/.env',
            isGlobal: true,
        }),
        DbModule,
        RabbitMQModule,
        RedisModule,
        MongoDBModule.forRoot(),
    ],
    controllers: [InventoryController, OrderCreationRequestedConsumer],
    providers: [
        CreateInventoryUseCase,
        HandleOrderCreationRequestedUseCase,
        FindAllInventoryUseCase,
        { provide: IInventoryListCachePort, useClass: RedisInventoryListCacheAdapter },
        { provide: IInventoryRepositoryPort, useClass: InventoryRepository },
        { provide: IInventoryEventsPublisherPort, useClass: InventoryRabbitMqPublisher },
        { provide: IReservationAuditLogPort, useClass: MongoReservationAuditLogRepository },
    ],
})
export class InventoryModule {}
