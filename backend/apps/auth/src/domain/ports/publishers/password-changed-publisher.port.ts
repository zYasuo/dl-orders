import { IPasswordChangedEvent } from '@app/shared';

export abstract class PasswordChangedPublisherPort {
  abstract publish(event: IPasswordChangedEvent): Promise<void>;
}
