import { Module } from '@nestjs/common';
import { IInventoryRepositoryPort } from 'src/inventory/domain/ports/inventory-repository.port';
import { InventoryRepository } from 'src/inventory/infrastructure/outbound/persistence/inventory.repository';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { IOrderEventsPublisherPort } from '../domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../domain/ports/orders-repository.port';
import { OrdersController } from '../infrastructure/inbound/http/orders.controller';
import { OrdersRabbitMqPublisher } from '../infrastructure/outbound/messaging/orders.publisher';
import { OrdersRepository } from '../infrastructure/outbound/persistence/orders.repository';
import { CreateOrderUseCase } from './use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from './use-cases/find-order-by-id.use-case';

@Module({
    imports: [RabbitMQModule],
    controllers: [OrdersController],
    providers: [
        CreateOrderUseCase,
        FindOrderByIdUseCase,
        {
            provide: IOrdersRepositoryPort,
            useClass: OrdersRepository,
        },
        {
            provide: IOrderEventsPublisherPort,
            useClass: OrdersRabbitMqPublisher,
        },
        {
            provide: IInventoryRepositoryPort,
            useClass: InventoryRepository,
        },
    ],
})
export class OrdersModule {}
