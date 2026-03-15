import { UserVerifiedEvent } from '@app/shared';
import { IUserVerifiedPublisherPort } from '../../src/domain/ports/publishers/user-verified-publisher.port';

export class FakeUserVerifiedPublisher extends IUserVerifiedPublisherPort {
    readonly published: UserVerifiedEvent[] = [];

    async publish(event: UserVerifiedEvent): Promise<void> {
        this.published.push(event);
    }
}
