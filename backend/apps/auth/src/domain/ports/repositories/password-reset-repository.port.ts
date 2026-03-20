import { PasswordResetEntity } from '../../entities/password-reset.entity';
import { TCreatePasswordReset } from '../../types/password-repository.type';

export abstract class PasswordResetRepositoryPort {
  abstract create(data: TCreatePasswordReset): Promise<PasswordResetEntity>;
  abstract findByLinkResetPassword(linkResetPassword: string): Promise<PasswordResetEntity | null>;
  abstract findByEmailLookupHash(emailLookupHash: string): Promise<PasswordResetEntity | null>;
  abstract consumeToken(linkResetPassword: string, emailLookupHash: string): Promise<boolean>;
}
