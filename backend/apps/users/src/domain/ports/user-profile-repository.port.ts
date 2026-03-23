import { UserProfileEntity } from '../entities/user-profile.entity';

export abstract class UserProfileRepositoryPort {
  abstract create(entity: UserProfileEntity): Promise<UserProfileEntity | null>;
  abstract ensureExists(entity: UserProfileEntity): Promise<void>;
  abstract findById(id: string): Promise<UserProfileEntity | null>;
  abstract update(entity: UserProfileEntity): Promise<UserProfileEntity | null>;
}
