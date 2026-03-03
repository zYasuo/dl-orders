import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ReduceStockWhenOrderCreatedUseCase } from '../../../application/use-cases/reduce-stock-when-order-created.use-case';
import { SReduceStock } from '../../../application/dto/reduce-stock-when-order-created.dto';

@Controller()
export class OrderWasCreatedConsumer {
    private readonly logger = new Logger(OrderWasCreatedConsumer.name);

    constructor(private readonly reduceStockUseCase: ReduceStockWhenOrderCreatedUseCase) {}

    @EventPattern('order.was_created')
    async handle(payload: unknown): Promise<void> {
        const raw = payload as Record<string, unknown>;
        const input = {
            id: raw?.stockId ?? raw?.id,
            quantity: raw?.quantity,
        };

        const parsed = SReduceStock.safeParse(input);
       
        if (!parsed.success) {
            this.logger.warn('Invalid order.was_created payload, skipping', {
                message: parsed.error.message,
            });
            return;
       
          }
          
        await this.reduceStockUseCase.execute(parsed.data);
    }
}
