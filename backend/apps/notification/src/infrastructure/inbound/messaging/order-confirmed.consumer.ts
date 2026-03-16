import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, IOrderConfirmedEvent } from '@app/shared';
import { HandleOrderConfirmedUseCase } from '../../../application/use-cases/handle-order-confirmed.use-case';

@Controller()
export class OrderConfirmedConsumer {
    private readonly logger = new Logger(OrderConfirmedConsumer.name);

    constructor(private readonly handleUseCase: HandleOrderConfirmedUseCase) {}

    @EventPattern(PATTERNS.ORDER_CONFIRMED)
    async handle(@Payload() payload: IOrderConfirmedEvent): Promise<void> {
        const { orderId } = payload;
        
        this.logger.log('Received order confirmed', { orderId });
        await this.handleUseCase.execute(payload);
    }
}
