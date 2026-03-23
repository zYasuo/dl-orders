import type { UserVerifiedEvent } from '@app/shared';
import { UserProfileProvisionerPort } from '../../src/domain/ports/user-profile-provisioner.port';

export class FakeUserProfileProvisioner extends UserProfileProvisionerPort {
  readonly provisioned: UserVerifiedEvent[] = [];

  async provision(event: UserVerifiedEvent): Promise<void> {
    this.provisioned.push(event);
  }
}
