import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, PaymentApprovedEvent } from '@app/shared';
import { ConfirmOrderUseCase } from '../../../application/use-cases/confirm-order.use-case';

@Controller()
export class PaymentApprovedConsumer {
  private readonly logger = new Logger(PaymentApprovedConsumer.name);

  constructor(private readonly confirmOrderUseCase: ConfirmOrderUseCase) {}

  @EventPattern(PATTERNS.PAYMENT_APPROVED)
  async handle(@Payload() payload: PaymentApprovedEvent): Promise<void> {
    this.logger.log('Payment approved, confirming order', { orderId: payload.orderId });
    await this.confirmOrderUseCase.execute({ orderId: payload.orderId });
  }
}
