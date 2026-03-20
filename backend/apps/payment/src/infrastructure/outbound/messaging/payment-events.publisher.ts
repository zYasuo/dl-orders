import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, PaymentApprovedEvent, PaymentFailedEvent } from '@app/shared';
import { PaymentEventsPublisherPort } from '../../../domain/ports/payment-events-publisher.port';

@Injectable()
export class PaymentRabbitMqPublisher extends PaymentEventsPublisherPort {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {
    super();
  }

  publishPaymentApproved(event: PaymentApprovedEvent): Promise<void> {
    this.ordersClient.emit(PATTERNS.PAYMENT_APPROVED, event);
    return Promise.resolve();
  }

  publishPaymentFailed(event: PaymentFailedEvent): Promise<void> {
    this.ordersClient.emit(PATTERNS.PAYMENT_FAILED, event);
    return Promise.resolve();
  }
}
