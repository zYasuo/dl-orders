import { Injectable } from '@nestjs/common';
import { PasswordResetEntity } from '../../domain/entities/password-reset.entity';
import { ResetPasswordPublisherPort } from '../../domain/ports/publishers/reset-password-publisher.port';
import { PasswordResetRepositoryPort } from '../../domain/ports/repositories/password-reset-repository.port';
import { EmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.port';
import { TCreateResetPasswordLink } from '../dto/create-reset-password-link.dto';

@Injectable()
export class CreateResetPasswordLinkUseCase {
  constructor(
    private readonly passwordResetRepository: PasswordResetRepositoryPort,
    private readonly emailEncrypted: EmailEncryptedSecurity,
    private readonly resetPasswordPublisher: ResetPasswordPublisherPort,
  ) {}

  async execute(input: TCreateResetPasswordLink): Promise<{ message: string }> {
    const { email } = input;

    const token = PasswordResetEntity.generateToken();
    const expiresAt = PasswordResetEntity.expiresAtFromNow();
    const now = new Date();

    const message =
      'If this email addres is registered, you will receive a reset password link in a few minutes.';

    const linkResetPassword = this.createLinkResetPassword(token);
    const emailLookupHash = await this.emailEncrypted.getLookupHash(email);

    const [existing, emailEncrypted] = await Promise.all([
      this.passwordResetRepository.findByEmailLookupHash(emailLookupHash),
      this.emailEncrypted.encrypt(email),
    ]);

    if (existing && existing.isValid()) {
      return { message };
    }

    await Promise.all([
      this.passwordResetRepository.create(
        PasswordResetEntity.create({
          id: token,
          emailEncrypted,
          emailLookupHash,
          linkResetPassword,
          used: false,
          expiresAt,
          createdAt: now,
          updatedAt: now,
        }),
      ),
      this.resetPasswordPublisher.publish({
        email,
        linkResetPassword,
        expiresAt,
      }),
    ]);

    return { message };
  }

  private createLinkResetPassword(token: string): string {
    return `${process.env.FRONTEND_URL_RESET_PASSWORD}?token=${token}`;
  }
}
