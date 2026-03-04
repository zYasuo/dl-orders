import { Module } from '@nestjs/common';
import { ProductModule } from 'src/product/application/product.module';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { IProductRepositoryPort } from '../../product/domain/ports/product-repository.ports';
import { ProductRepository } from '../../product/infrastructure/outbound/product.repository';
import { IStockRepositoryPort } from '../domain/ports/stock-repository.port';
import { StockController } from '../infrastructure/inbound/http/stock.controller';
import { OrderWasCreatedConsumer } from '../infrastructure/inbound/messaging/order-was-created.consumer';
import { StockRepository } from '../infrastructure/outbound/persistence/stock.repository';
import { CreateStockWithProductRelationUseCase } from './use-cases/create-stock-with-product-relation.use-case';
import { ReduceStockWhenOrderCreatedUseCase } from './use-cases/reduce-stock-when-order-created.use-case';

@Module({
    imports: [RabbitMQModule, ProductModule],
    controllers: [OrderWasCreatedConsumer, StockController],
    providers: [
        ReduceStockWhenOrderCreatedUseCase,
        CreateStockWithProductRelationUseCase,
        {
            provide: IStockRepositoryPort,
            useClass: StockRepository,
        },
        {
            provide: IProductRepositoryPort,
            useClass: ProductRepository,
        },
    ],
})
export class StockModule {}
