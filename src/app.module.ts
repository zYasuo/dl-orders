import { Module } from '@nestjs/common';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { DbModule } from './infrastructure/db/db.module';
import { OrdersModule } from './orders/application/orders.module';
import { StockModule } from './stock/application/stock.module';

@Module({
  imports: [RabbitMQModule, DbModule, OrdersModule, StockModule],
})
export class AppModule {}
