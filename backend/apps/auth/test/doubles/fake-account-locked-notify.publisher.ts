import { AccountLockedNotifyEvent } from '@app/shared';
import { IAccountLockedNotifyPublisherPort } from '../../src/domain/ports/account-locked-notify-publisher.port';

export class FakeAccountLockedNotifyPublisher extends IAccountLockedNotifyPublisherPort {
    readonly published: AccountLockedNotifyEvent[] = [];

    async publish(event: AccountLockedNotifyEvent): Promise<void> {
        this.published.push(event);
    }
}
