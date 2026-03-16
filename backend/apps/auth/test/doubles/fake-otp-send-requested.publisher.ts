import { IOtpSendRequestedEvent } from '@app/shared';
import { IOtpSendRequestedPublisherPort } from '../../src/domain/ports/publishers/otp-send-requested-publisher.port';

export class FakeOtpSendRequestedPublisher extends IOtpSendRequestedPublisherPort {
    readonly published: IOtpSendRequestedEvent[] = [];

    async publish(event: IOtpSendRequestedEvent): Promise<void> {
        this.published.push(event);
    }
}
