import { Module } from '@nestjs/common';
import { DbModule } from './infrastructure/db/db.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { NotificationModule } from './notification/application/notification.module';
import { OrdersModule } from './orders/application/orders.module';
import { ProductModule } from './product/application/product.module';
import { InventoryModule } from './inventory/application/inventory.module';

@Module({
    imports: [RabbitMQModule, DbModule, OrdersModule, InventoryModule, ProductModule, NotificationModule],
})
export class AppModule {}
