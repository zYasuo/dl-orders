import { OtpSendRequestedEvent } from '@app/shared';
import { IOtpSendRequestedPublisherPort } from '../../src/domain/ports/publishers/otp-send-requested-publisher.port';

export class FakeOtpSendRequestedPublisher extends IOtpSendRequestedPublisherPort {
    readonly published: OtpSendRequestedEvent[] = [];

    async publish(event: OtpSendRequestedEvent): Promise<void> {
        this.published.push(event);
    }
}
