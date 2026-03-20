import { IOtpSendRequestedEvent } from '@app/shared';

export abstract class OtpSendRequestedPublisherPort {
  abstract publish(event: IOtpSendRequestedEvent): Promise<void>;
}
