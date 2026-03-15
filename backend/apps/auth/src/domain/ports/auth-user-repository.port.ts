import { UserEntity } from '../entities/user.entity';
import { TCreateAuthUser } from '../types/auth-user-repository.types';

export abstract class IAuthUserRepositoryPort {
    abstract create(data: TCreateAuthUser): Promise<UserEntity | null>;
    abstract findByEmailLookupHash(emailLookupHash: string): Promise<UserEntity | null>;
    abstract markEmailVerified(id: string): Promise<UserEntity | null>;
    abstract changePassword(id: string, password: string): Promise<boolean>;
}
