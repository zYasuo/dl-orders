import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, AccountLockedNotifyEvent } from '@app/shared';
import { IAccountLockedNotifyPublisherPort } from '../../../domain/ports/account-locked-notify-publisher.port';

@Injectable()
export class AccountLockedNotifyRabbitMqPublisher extends IAccountLockedNotifyPublisherPort {
    constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy) {
        super();
    }

    async publish(event: AccountLockedNotifyEvent): Promise<void> {
        this.notificationClient.emit(PATTERNS.ACCOUNT_LOCKED_NOTIFY, event);
    }
}
