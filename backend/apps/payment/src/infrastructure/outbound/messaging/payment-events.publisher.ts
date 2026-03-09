import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, PaymentApprovedEvent, PaymentFailedEvent } from '@app/shared';
import { IPaymentEventsPublisherPort } from '../../../domain/ports/payment-events-publisher.port';

@Injectable()
export class PaymentRabbitMqPublisher extends IPaymentEventsPublisherPort {
    constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {
        super();
    }

    async publishPaymentApproved(event: PaymentApprovedEvent): Promise<void> {
        this.ordersClient.emit(PATTERNS.PAYMENT_APPROVED, event);
    }

    async publishPaymentFailed(event: PaymentFailedEvent): Promise<void> {
        this.ordersClient.emit(PATTERNS.PAYMENT_FAILED, event);
    }
}
