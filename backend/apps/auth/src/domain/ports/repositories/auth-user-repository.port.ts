import { UserEntity } from '../../entities/user.entity';

export abstract class AuthUserRepositoryPort {
  abstract create(entity: UserEntity): Promise<UserEntity | null>;
  abstract findByEmailLookupHash(emailLookupHash: string): Promise<UserEntity | null>;
  abstract markEmailVerified(id: string): Promise<UserEntity | null>;
  abstract changePassword(id: string, password: string): Promise<boolean>;
}
