import { PaymentApprovedEvent, PaymentFailedEvent } from '@app/shared';

export abstract class PaymentEventsPublisherPort {
  abstract publishPaymentApproved(event: PaymentApprovedEvent): Promise<void>;
  abstract publishPaymentFailed(event: PaymentFailedEvent): Promise<void>;
}
