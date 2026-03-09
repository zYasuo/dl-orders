import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, PaymentFailedEvent } from '@app/shared';
import { CancelOrderUseCase } from '../../../application/use-cases/cancel-order.use-case';

@Controller()
export class PaymentFailedConsumer {
    private readonly logger = new Logger(PaymentFailedConsumer.name);

    constructor(private readonly cancelOrderUseCase: CancelOrderUseCase) {}

    @EventPattern(PATTERNS.PAYMENT_FAILED)
    async handle(@Payload() payload: PaymentFailedEvent): Promise<void> {
        this.logger.warn(`Payment failed, cancelling order. orderId=${payload.orderId} reason=${payload.reason}`);
        await this.cancelOrderUseCase.execute({ orderId: payload.orderId, reason: payload.reason });
    }
}
