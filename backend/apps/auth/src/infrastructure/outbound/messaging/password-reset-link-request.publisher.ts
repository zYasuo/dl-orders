import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { PATTERNS, IResetPasswordRequestEvent } from "@app/shared";
import { IResetPasswordPublisherPort } from '../../../domain/ports/publishers/reset-password-publisher.port';

@Injectable()
export class PasswordResetLinkRequestRabbitMqPublisher extends IResetPasswordPublisherPort {
    constructor(@Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy) {
        super();
    }

    async publish(event: IResetPasswordRequestEvent): Promise<void> {
        this.notificationClient.emit(PATTERNS.RESET_PASSWORD_LINK_REQUESTED, event);
    }
}