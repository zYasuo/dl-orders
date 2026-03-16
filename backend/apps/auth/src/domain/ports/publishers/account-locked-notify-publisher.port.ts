import { IAccountLockedNotifyEvent } from '@app/shared';

export abstract class IAccountLockedNotifyPublisherPort {
    abstract publish(event: IAccountLockedNotifyEvent): Promise<void>;
}
