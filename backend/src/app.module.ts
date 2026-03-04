import { Module } from '@nestjs/common';
import { DbModule } from './infrastructure/db/db.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { OrdersModule } from './orders/application/orders.module';
import { ProductModule } from './product/application/product.module';
import { StockModule } from './stock/application/stock.module';

@Module({
    imports: [RabbitMQModule, DbModule, OrdersModule, StockModule, ProductModule],
})
export class AppModule {}
