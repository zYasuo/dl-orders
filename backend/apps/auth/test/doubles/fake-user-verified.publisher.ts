import { UserVerifiedEvent } from '@app/shared';
import { UserVerifiedPublisherPort } from '../../src/domain/ports/publishers/user-verified-publisher.port';

export class FakeUserVerifiedPublisher extends UserVerifiedPublisherPort {
  readonly published: UserVerifiedEvent[] = [];

  async publish(event: UserVerifiedEvent): Promise<void> {
    this.published.push(event);
  }
}
