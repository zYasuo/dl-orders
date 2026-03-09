import { PaymentApprovedEvent, PaymentFailedEvent } from '@app/shared';
import { IPaymentEventsPublisherPort } from '../../src/domain/ports/payment-events-publisher.port';

export class FakePaymentEventsPublisher extends IPaymentEventsPublisherPort {
    readonly approved: PaymentApprovedEvent[] = [];
    readonly failed: PaymentFailedEvent[] = [];

    async publishPaymentApproved(event: PaymentApprovedEvent): Promise<void> {
        this.approved.push(event);
    }

    async publishPaymentFailed(event: PaymentFailedEvent): Promise<void> {
        this.failed.push(event);
    }
}
