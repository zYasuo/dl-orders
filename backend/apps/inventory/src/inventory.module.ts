import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './infrastructure/db/db.module';
import { DynamoDBModule } from './infrastructure/dynamodb/dynamodb.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { IInventoryEventsPublisherPort } from './domain/ports/inventory-events-publisher.port';
import { IInventoryRepositoryPort } from './domain/ports/inventory-repository.port';
import { IReservationAuditLogPort } from './domain/ports/reservation-audit-log.port';
import { InventoryController } from './infrastructure/inbound/http/inventory.controller';
import { OrderCreationRequestedConsumer } from './infrastructure/inbound/messaging/order-creation-requested.consumer';
import { InventoryRabbitMqPublisher } from './infrastructure/outbound/messaging/inventory-events.publisher';
import { DynamoDBReservationAuditLogRepository } from './infrastructure/outbound/persistence/dynamodb/reservation-audit-log.repository';
import { InventoryRepository } from './infrastructure/outbound/persistence/sql/inventory.repository';
import { CreateInventoryUseCase } from './application/use-cases/create-inventory.use-case';
import { HandleOrderCreationRequestedUseCase } from './application/use-cases/handle-order-creation-requested.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/inventory/.env',
            isGlobal: true,
        }),
        DbModule,
        RabbitMQModule,
        DynamoDBModule.forRoot(),
    ],
    controllers: [InventoryController, OrderCreationRequestedConsumer],
    providers: [
        CreateInventoryUseCase,
        HandleOrderCreationRequestedUseCase,
        { provide: IInventoryRepositoryPort, useClass: InventoryRepository },
        { provide: IInventoryEventsPublisherPort, useClass: InventoryRabbitMqPublisher },
        { provide: IReservationAuditLogPort, useClass: DynamoDBReservationAuditLogRepository },
    ],
})
export class InventoryModule {}
