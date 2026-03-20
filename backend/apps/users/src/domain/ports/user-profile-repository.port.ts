import { UserProfileEntity } from '../entities/user-profile.entity';
import { TCreateUserProfile, TUpdateUserProfile } from '../types/user-profile-repository.types';

export abstract class UserProfileRepositoryPort {
  abstract create(data: TCreateUserProfile): Promise<UserProfileEntity | null>;
  abstract findById(id: string): Promise<UserProfileEntity | null>;
  abstract update(id: string, data: TUpdateUserProfile): Promise<UserProfileEntity | null>;
}
