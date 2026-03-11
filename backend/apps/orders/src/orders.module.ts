import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from '@app/shared';
import { DbModule } from './infrastructure/db/db.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { IOrderAuditLogPort } from './domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from './domain/ports/order-events-publisher.port';
import { IProductCatalogPort } from './domain/ports/product-catalog.port';
import { IOrderSummaryPort } from './domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from './domain/ports/orders-repository.port';
import { OrdersController } from './infrastructure/inbound/http/orders.controller';
import { InventoryReservedConsumer } from './infrastructure/inbound/messaging/inventory-reserved.consumer';
import { InventoryReservationFailedConsumer } from './infrastructure/inbound/messaging/inventory-reservation-failed.consumer';
import { PaymentApprovedConsumer } from './infrastructure/inbound/messaging/payment-approved.consumer';
import { PaymentFailedConsumer } from './infrastructure/inbound/messaging/payment-failed.consumer';
import { OrdersRabbitMqPublisher } from './infrastructure/outbound/messaging/orders.publisher';
import { ProductCatalogHttpClient } from './infrastructure/outbound/http/product-catalog.client';
import { OrdersRepository } from './infrastructure/outbound/persistence/sql/orders.repository';
import { MongoOrderAuditLogRepository } from './infrastructure/outbound/persistence/mongodb/order-audit-log.repository';
import { MongoOrderSummaryRepository } from './infrastructure/outbound/persistence/mongodb/order-summary.repository';
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
        MongoDBModule.forRoot(),
    ],
    controllers: [OrdersController, InventoryReservedConsumer, InventoryReservationFailedConsumer, PaymentApprovedConsumer, PaymentFailedConsumer],
    providers: [
        CreateOrderUseCase,
        FindOrderByIdUseCase,
        ConfirmOrderUseCase,
        CancelOrderUseCase,
        { provide: IOrdersRepositoryPort, useClass: OrdersRepository },
        { provide: IProductCatalogPort, useClass: ProductCatalogHttpClient },
        { provide: IOrderEventsPublisherPort, useClass: OrdersRabbitMqPublisher },
        { provide: IOrderAuditLogPort, useClass: MongoOrderAuditLogRepository },
        { provide: IOrderSummaryPort, useClass: MongoOrderSummaryRepository },
    ],
})
export class OrdersModule {}
