import { IAccountLockedNotifyEvent } from '@app/shared';

export abstract class AccountLockedNotifyPublisherPort {
  abstract publish(event: IAccountLockedNotifyEvent): Promise<void>;
}
