import { AccountLockedNotifyEvent } from '@app/shared';

export abstract class IAccountLockedNotifyPublisherPort {
    abstract publish(event: AccountLockedNotifyEvent): Promise<void>;
}
