import { Module } from '@nestjs/common';
import { ReduceStockWhenOrderCreatedUseCase } from './use-cases/reduce-stock-when-order-created.use-case';
import { StockRepositoryPort } from '../../domain/stock/ports/stock-repository.port';
import { StockRepository } from '../../infrastructure/outbound/persistence/stock/stock.repository';
import { OrderWasCreatedConsumer } from '../../infrastructure/inbound/messaging/rabbitmq/stock/order-was-created.consumer';

@Module({
  controllers: [OrderWasCreatedConsumer],
  providers: [
    ReduceStockWhenOrderCreatedUseCase,
    {
      provide: StockRepositoryPort,
      useClass: StockRepository,
    },
  ],
})
export class StockModule {}
