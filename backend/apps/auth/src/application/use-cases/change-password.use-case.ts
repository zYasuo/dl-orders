import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordChangedPublisherPort } from '../../domain/ports/publishers/password-changed-publisher.port';
import { AuthUserRepositoryPort } from '../../domain/ports/repositories/auth-user-repository.port';
import { PasswordResetRepositoryPort } from '../../domain/ports/repositories/password-reset-repository.port';
import { EmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.port';
import { PasswordHasherPort } from '../../domain/ports/security/password-hasher.port';
import { TChangePassword } from '../dto/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly passwordResetRepository: PasswordResetRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly emailEncrypted: EmailEncryptedSecurity,
    private readonly passwordChangedPublisher: PasswordChangedPublisherPort,
  ) {}

  async execute(input: TChangePassword): Promise<{ message: string }> {
    const { token, email, new_password } = input;

    const now = new Date();
    const message = 'Password changed successfully';

    const emailLookupHash = await this.emailEncrypted.getLookupHash(email);

    const tokenConsumed = await this.passwordResetRepository.consumeToken(token, emailLookupHash);

    if (!tokenConsumed) {
      throw new BadRequestException('Token already used or expired');
    }

    const user = await this.authUserRepository.findByEmailLookupHash(emailLookupHash);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await this.passwordHasher.hash(new_password);

    await this.authUserRepository.changePassword(user.id, passwordHash);

    await this.passwordChangedPublisher.publish({
      email: email,
      changedAt: now,
    });

    return { message };
  }
}

