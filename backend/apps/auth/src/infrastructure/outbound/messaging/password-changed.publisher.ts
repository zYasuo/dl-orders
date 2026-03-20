import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, IPasswordChangedEvent } from '@app/shared';
import { PasswordChangedPublisherPort } from '../../../domain/ports/publishers/password-changed-publisher.port';

@Injectable()
export class PasswordChangedRabbitMqPublisher extends PasswordChangedPublisherPort {
  constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy) {
    super();
  }

  publish(event: IPasswordChangedEvent): Promise<void> {
    this.notificationClient.emit(PATTERNS.PASSWORD_CHANGED, event);
    return Promise.resolve();
  }
}
