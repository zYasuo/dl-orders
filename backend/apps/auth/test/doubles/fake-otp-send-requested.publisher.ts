import { IOtpSendRequestedEvent } from '@app/shared';
import { OtpSendRequestedPublisherPort } from '../../src/domain/ports/publishers/otp-send-requested-publisher.port';

export class FakeOtpSendRequestedPublisher extends OtpSendRequestedPublisherPort {
  readonly published: IOtpSendRequestedEvent[] = [];

  async publish(event: IOtpSendRequestedEvent): Promise<void> {
    this.published.push(event);
  }
}
