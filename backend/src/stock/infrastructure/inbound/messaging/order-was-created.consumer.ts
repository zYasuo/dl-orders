import { Controller, Logger, UsePipes } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SReduceStock, type TReduceStock } from '../../../application/dto/reduce-stock-when-order-created.dto';
import { ReduceStockWhenOrderCreatedUseCase } from '../../../application/use-cases/reduce-stock-when-order-created.use-case';

@Controller()
export class OrderWasCreatedConsumer {
    private readonly logger = new Logger(OrderWasCreatedConsumer.name);

    constructor(private readonly reduceStockUseCase: ReduceStockWhenOrderCreatedUseCase) {}

    @EventPattern('order.was_created')
    @UsePipes(new ZodValidationPipe(SReduceStock))
    async handle(@Payload() payload: TReduceStock): Promise<void> {
        ~this.logger.log('Reducing stock for order', { payload });

        await this.reduceStockUseCase.execute(payload);
    }
}
