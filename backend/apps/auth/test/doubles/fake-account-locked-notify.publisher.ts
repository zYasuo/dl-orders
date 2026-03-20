import { IAccountLockedNotifyEvent } from '@app/shared';
import { AccountLockedNotifyPublisherPort } from '../../src/domain/ports/publishers/account-locked-notify-publisher.port';

export class FakeAccountLockedNotifyPublisher extends AccountLockedNotifyPublisherPort {
  readonly published: IAccountLockedNotifyEvent[] = [];

  async publish(event: IAccountLockedNotifyEvent): Promise<void> {
    this.published.push(event);
  }
}
