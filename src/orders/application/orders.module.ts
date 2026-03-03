import { Module } from '@nestjs/common';
import { OrdersController } from '../infrastructure/inbound/http/orders.controller';
import { CreateOrderUseCase } from './use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from './use-cases/find-order-by-id.use-case';
import { IOrdersRepositoryPort } from '../domain/ports/orders-repository.port';
import { IOrderEventsPublisherPort } from '../domain/ports/order-events-publisher.port';
import { OrdersRepository } from '../infrastructure/outbound/persistence/orders.repository';
import { OrdersRabbitMqPublisher } from '../infrastructure/outbound/messaging/orders.publisher';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';

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
  ],
})
export class OrdersModule {}
