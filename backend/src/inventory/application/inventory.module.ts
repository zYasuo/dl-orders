import { Module } from '@nestjs/common';
import { ProductModule } from 'src/product/application/product.module';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { IProductRepositoryPort } from '../../product/domain/ports/product-repository.ports';
import { ProductRepository } from '../../product/infrastructure/outbound/product.repository';
import { IInventoryRepositoryPort } from '../domain/ports/inventory-repository.port';
import { InventoryController } from '../infrastructure/inbound/http/inventory.controller';
import { OrderWasCreatedConsumer } from '../infrastructure/inbound/messaging/order-was-created.consumer';
import { InventoryRepository } from '../infrastructure/outbound/persistence/inventory.repository';
import { CreateInventoryWithProductRelationUseCase } from './use-cases/create-inventory-with-product-relation.use-case';
import { ReduceInventoryWhenOrderCreatedUseCase } from './use-cases/reduce-inventory-when-order-created.use-case';

@Module({
    imports: [RabbitMQModule, ProductModule],
    controllers: [OrderWasCreatedConsumer, InventoryController],
    providers: [
        ReduceInventoryWhenOrderCreatedUseCase,
        CreateInventoryWithProductRelationUseCase,
        {
            provide: IInventoryRepositoryPort,
            useClass: InventoryRepository,
        },
        {
            provide: IProductRepositoryPort,
            useClass: ProductRepository,
        },
    ],
})
export class InventoryModule {}
