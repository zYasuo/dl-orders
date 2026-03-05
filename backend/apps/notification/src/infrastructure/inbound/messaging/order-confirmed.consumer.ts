import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, OrderConfirmedEvent } from '@app/shared';
import { HandleOrderConfirmedUseCase } from '../../../application/use-cases/handle-order-confirmed.use-case';

@Controller()
export class OrderConfirmedConsumer {
    private readonly logger = new Logger(OrderConfirmedConsumer.name);

    constructor(private readonly handleUseCase: HandleOrderConfirmedUseCase) {}

    @EventPattern(PATTERNS.ORDER_CONFIRMED)
    async handle(@Payload() payload: OrderConfirmedEvent): Promise<void> {
        this.logger.log('Received order confirmed', { orderId: payload.orderId });
        await this.handleUseCase.execute(payload);
    }
}
