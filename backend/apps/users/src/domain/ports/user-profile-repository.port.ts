import { UserProfile } from '../entities/user-profile.entity';
import { TCreateUserProfile, TUpdateUserProfile } from '../types/user-profile-repository.types';

export abstract class IUserProfileRepositoryPort {
    abstract create(data: TCreateUserProfile): Promise<UserProfile | null>;
    abstract findById(id: string): Promise<UserProfile | null>;
    abstract update(id: string, data: TUpdateUserProfile): Promise<UserProfile | null>;
}
