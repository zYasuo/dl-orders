import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './infrastructure/db/db.module';
import { DynamoDBModule } from './infrastructure/dynamodb/dynamodb.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { IOrderAuditLogPort } from './domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from './domain/ports/order-events-publisher.port';
import { IOrderSummaryPort } from './domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from './domain/ports/orders-repository.port';
import { OrdersController } from './infrastructure/inbound/http/orders.controller';
import { InventoryReservedConsumer } from './infrastructure/inbound/messaging/inventory-reserved.consumer';
import { InventoryReservationFailedConsumer } from './infrastructure/inbound/messaging/inventory-reservation-failed.consumer';
import { OrdersRabbitMqPublisher } from './infrastructure/outbound/messaging/orders.publisher';
import { OrdersRepository } from './infrastructure/outbound/persistence/sql/orders.repository';
import { DynamoDBOrderAuditLogRepository } from './infrastructure/outbound/persistence/dynamodb/order-audit-log.repository';
import { DynamoDBOrderSummaryRepository } from './infrastructure/outbound/persistence/dynamodb/order-summary.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from './application/use-cases/find-order-by-id.use-case';
import { ConfirmOrderUseCase } from './application/use-cases/confirm-order.use-case';
import { CancelOrderUseCase } from './application/use-cases/cancel-order.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/orders/.env',
            isGlobal: true,
        }),
        DbModule,
        RabbitMQModule,
        DynamoDBModule.forRoot(),
    ],
    controllers: [OrdersController, InventoryReservedConsumer, InventoryReservationFailedConsumer],
    providers: [
        CreateOrderUseCase,
        FindOrderByIdUseCase,
        ConfirmOrderUseCase,
        CancelOrderUseCase,
        { provide: IOrdersRepositoryPort, useClass: OrdersRepository },
        { provide: IOrderEventsPublisherPort, useClass: OrdersRabbitMqPublisher },
        { provide: IOrderAuditLogPort, useClass: DynamoDBOrderAuditLogRepository },
        { provide: IOrderSummaryPort, useClass: DynamoDBOrderSummaryRepository },
    ],
})
export class OrdersModule {}
