import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, IOtpSendRequestedEvent } from '@app/shared';
import { IOtpSendRequestedPublisherPort } from '../../../domain/ports/publishers/otp-send-requested-publisher.port';

@Injectable()
export class OtpSendRequestedRabbitMqPublisher extends IOtpSendRequestedPublisherPort {
    constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy) {
        super();
    }

    publish(event: IOtpSendRequestedEvent): Promise<void> {
        this.notificationClient.emit(PATTERNS.OTP_SEND_REQUESTED, event);
        return Promise.resolve();
    }
}
