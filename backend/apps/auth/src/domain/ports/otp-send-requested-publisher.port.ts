import { OtpSendRequestedEvent } from '@app/shared';

export abstract class IOtpSendRequestedPublisherPort {
    abstract publish(event: OtpSendRequestedEvent): Promise<void>;
}
