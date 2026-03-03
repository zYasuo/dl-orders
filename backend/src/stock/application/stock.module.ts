import { Module } from '@nestjs/common';
import { ReduceStockWhenOrderCreatedUseCase } from './use-cases/reduce-stock-when-order-created.use-case';
import { IStockRepositoryPort } from '../domain/ports/stock-repository.port';
import { StockRepository } from '../infrastructure/outbound/persistence/stock.repository';
import { OrderWasCreatedConsumer } from '../infrastructure/inbound/messaging/order-was-created.consumer';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';

@Module({
    imports: [RabbitMQModule],
    controllers: [OrderWasCreatedConsumer],
    providers: [
        ReduceStockWhenOrderCreatedUseCase,
        {
            provide: IStockRepositoryPort,
            useClass: StockRepository,
        },
    ],
})
export class StockModule {}
