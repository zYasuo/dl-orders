import { PasswordResetEntity } from '../../entities/password-reset.entity';

export abstract class PasswordResetRepositoryPort {
  abstract create(entity: PasswordResetEntity): Promise<PasswordResetEntity>;
  abstract findByLinkResetPassword(linkResetPassword: string): Promise<PasswordResetEntity | null>;
  abstract findByEmailLookupHash(emailLookupHash: string): Promise<PasswordResetEntity | null>;
  abstract consumeToken(linkResetPassword: string, emailLookupHash: string): Promise<boolean>;
}
