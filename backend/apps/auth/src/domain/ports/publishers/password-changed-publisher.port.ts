import { IPasswordChangedEvent } from '@app/shared';

export abstract class IPasswordChangedPublisherPort {
    abstract publish(event: IPasswordChangedEvent): Promise<void>;
}
