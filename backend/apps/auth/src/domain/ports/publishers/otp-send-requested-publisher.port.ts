import { IOtpSendRequestedEvent } from '@app/shared';

export abstract class IOtpSendRequestedPublisherPort {
  abstract publish(event: IOtpSendRequestedEvent): Promise<void>;
}
