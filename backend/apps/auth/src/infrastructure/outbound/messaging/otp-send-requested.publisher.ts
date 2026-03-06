import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, OtpSendRequestedEvent } from '@app/shared';
import { IOtpSendRequestedPublisherPort } from '../../../domain/ports/otp-send-requested-publisher.port';

@Injectable()
export class OtpSendRequestedRabbitMqPublisher extends IOtpSendRequestedPublisherPort {
    constructor(
        @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    ) {
        super();
    }

    async publish(event: OtpSendRequestedEvent): Promise<void> {
        this.notificationClient.emit(PATTERNS.OTP_SEND_REQUESTED, event);
    }
}
