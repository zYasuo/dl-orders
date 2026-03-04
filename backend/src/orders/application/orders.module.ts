import { Module } from '@nestjs/common';
import { IProductRepositoryPort } from 'src/product/domain/ports/product-repository.ports';
import { ProductRepository } from 'src/product/infrastructure/outbound/product.repository';
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
            provide: IProductRepositoryPort,
            useClass: ProductRepository,
        },
    ],
})
export class OrdersModule {}
