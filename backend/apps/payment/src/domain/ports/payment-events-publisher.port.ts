import { PaymentApprovedEvent, PaymentFailedEvent } from '@app/shared';

export abstract class IPaymentEventsPublisherPort {
    abstract publishPaymentApproved(event: PaymentApprovedEvent): Promise<void>;
    abstract publishPaymentFailed(event: PaymentFailedEvent): Promise<void>;
}
