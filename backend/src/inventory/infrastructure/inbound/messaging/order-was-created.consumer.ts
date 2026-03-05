import { Controller, Logger, UsePipes } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SReduceInventory, type TReduceInventory } from '../../../application/dto/reduce-inventory-when-order-created.dto';
import { ReduceInventoryWhenOrderCreatedUseCase } from '../../../application/use-cases/reduce-inventory-when-order-created.use-case';

@Controller()
export class OrderWasCreatedConsumer {
    private readonly logger = new Logger(OrderWasCreatedConsumer.name);

    constructor(private readonly reduceInventoryUseCase: ReduceInventoryWhenOrderCreatedUseCase) {}

    @EventPattern('order.was_created')
    @UsePipes(new ZodValidationPipe(SReduceInventory))
    async handle(@Payload() payload: TReduceInventory): Promise<void> {
        this.logger.log('Reducing inventory for order', { payload });

        await this.reduceInventoryUseCase.execute(payload);
    }
}
