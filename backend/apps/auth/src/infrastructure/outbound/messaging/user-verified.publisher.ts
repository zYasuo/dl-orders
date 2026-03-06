import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PATTERNS, UserVerifiedEvent } from '@app/shared';
import { IUserVerifiedPublisherPort } from '../../../domain/ports/user-verified-publisher.port';

@Injectable()
export class UserVerifiedRabbitMqPublisher extends IUserVerifiedPublisherPort {
    constructor(
        @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    ) {
        super();
    }

    async publish(event: UserVerifiedEvent): Promise<void> {
        this.usersClient.emit(PATTERNS.USER_VERIFIED, event);
    }
}
