import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, UserVerifiedEvent } from '@app/shared';
import { UserVerifiedPublisherPort } from '../../../domain/ports/publishers/user-verified-publisher.port';

@Injectable()
export class UserVerifiedRabbitMqPublisher extends UserVerifiedPublisherPort {
  constructor(@Inject('USERS_SERVICE') private readonly usersClient: ClientProxy) {
    super();
  }

  publish(event: UserVerifiedEvent): Promise<void> {
    this.usersClient.emit(PATTERNS.USER_VERIFIED, event);
    return Promise.resolve();
  }
}
