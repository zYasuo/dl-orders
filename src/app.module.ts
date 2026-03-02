import { Module } from '@nestjs/common';
import { RabbitMQModule } from './infrastructure/outbound/messaging/rabbitmq/rabbitmq.module';
import { DbModule } from './infrastructure/outbound/persistence/db/db.module';
import { OrdersModule } from './application/orders/orders.module';
import { StockModule } from './application/stock/stock.module';

@Module({
  imports: [RabbitMQModule, DbModule, OrdersModule, StockModule],
})
export class AppModule {}
