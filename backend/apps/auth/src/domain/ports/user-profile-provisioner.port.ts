import type { UserVerifiedEvent } from '@app/shared';

export abstract class UserProfileProvisionerPort {
  abstract provision(event: UserVerifiedEvent): Promise<void>;
}
