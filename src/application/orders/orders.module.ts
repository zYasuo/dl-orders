import { Module } from '@nestjs/common';
import { OrdersController } from '../../infrastructure/inbound/http/orders/orders.controller';
import { CreateOrderUseCase } from './use-cases/create-order.use-case';
import { ListOrdersUseCase } from './use-cases/list-orders.use-case';
import { OrdersRepositoryPort } from '../../domain/orders/ports/orders-repository.port';
import { OrderEventsPublisherPort } from '../../domain/orders/ports/order-events-publisher.port';
import { OrdersRepository } from '../../infrastructure/outbound/persistence/orders/orders.repository';
import { OrdersRabbitMqPublisher } from '../../infrastructure/outbound/messaging/rabbitmq/orders/orders.publisher';
import { RabbitMQModule } from '../../infrastructure/outbound/messaging/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    ListOrdersUseCase,
    {
      provide: OrdersRepositoryPort,
      useClass: OrdersRepository,
    },
    {
      provide: OrderEventsPublisherPort,
      useClass: OrdersRabbitMqPublisher,
    },
  ],
})
export class OrdersModule {}

