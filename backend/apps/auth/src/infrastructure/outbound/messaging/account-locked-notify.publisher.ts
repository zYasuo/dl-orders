import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, IAccountLockedNotifyEvent } from '@app/shared';
import { IAccountLockedNotifyPublisherPort } from '../../../domain/ports/publishers/account-locked-notify-publisher.port';

@Injectable()
export class AccountLockedNotifyRabbitMqPublisher extends IAccountLockedNotifyPublisherPort {
  constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy) {
    super();
  }

  publish(event: IAccountLockedNotifyEvent): Promise<void> {
    this.notificationClient.emit(PATTERNS.ACCOUNT_LOCKED_NOTIFY, event);
    return Promise.resolve();
  }
}
