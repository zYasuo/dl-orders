import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, OrderCreationRequestedEvent } from '@app/shared';
import { HandleOrderCreationRequestedUseCase } from '../../../application/use-cases/handle-order-creation-requested.use-case';

@Controller()
export class OrderCreationRequestedConsumer {
    private readonly logger = new Logger(OrderCreationRequestedConsumer.name);

    constructor(private readonly handleUseCase: HandleOrderCreationRequestedUseCase) {}

    @EventPattern(PATTERNS.ORDER_CREATION_REQUESTED)
    async handle(@Payload() payload: OrderCreationRequestedEvent): Promise<void> {
        this.logger.log('Received order creation requested', { orderId: payload.orderId });
        await this.handleUseCase.execute(payload);
    }
}
