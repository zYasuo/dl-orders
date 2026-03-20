import { UserVerifiedEvent } from '@app/shared';

export abstract class UserVerifiedPublisherPort {
  abstract publish(event: UserVerifiedEvent): Promise<void>;
}
