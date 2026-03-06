import { UserVerifiedEvent } from '@app/shared';

export abstract class IUserVerifiedPublisherPort {
    abstract publish(event: UserVerifiedEvent): Promise<void>;
}
