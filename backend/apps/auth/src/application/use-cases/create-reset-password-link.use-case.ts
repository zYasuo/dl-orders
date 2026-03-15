import { Injectable } from '@nestjs/common';
import { IPasswordResetRepositoryPort } from 'apps/auth/src/domain/ports/password-reset-repository.port';
import { TCreateResetPasswordLink } from '../dto/create-reset-password-link.dto';
import { IEmailEncryptedSecurity } from '../../domain/ports/email-encrypted.security';
import { PasswordResetEntity } from '../../domain/entities/password-reset.entity';
import { TCreatePasswordReset } from '../../domain/types/password-repository.type';
import { IResetPasswordPublisherPort } from '../../domain/ports/reset-password-publisher.port';

@Injectable()
export class CreateResetPasswordLinkUseCase {
    constructor(
        private readonly passwordResetRepository: IPasswordResetRepositoryPort,
        private readonly emailEncrypted: IEmailEncryptedSecurity,
        private readonly resetPasswordPublisher: IResetPasswordPublisherPort,
    ) {}

    async execute(input: TCreateResetPasswordLink): Promise<string> {
        const { email } = input;

        const token = PasswordResetEntity.generateToken();
        const expiresAt = PasswordResetEntity.expiresAtFromNow();

        const message = 'If this email addres is registered, you will receive a reset password link in a few minutes.';

        const emailLookupHash = await this.emailEncrypted.getLookupHash(email);

        const [existing, emailEncrypted] = await Promise.all([
            this.passwordResetRepository.findByEmailLookupHash(emailLookupHash),
            this.emailEncrypted.encrypt(email),
        ]);

        if (existing && !PasswordResetEntity.isExpired(existing.expiresAt) && !PasswordResetEntity.isUsed(existing.used)) {
            return message;
        }

        const createData: TCreatePasswordReset = {
            emailEncrypted,
            emailLookupHash,
            token,
            expiresAt,
        };

        await Promise.all([
            this.passwordResetRepository.create(createData),
            this.resetPasswordPublisher.publish({
                email,
                token,
                expiresAt,
            }),
        ]);

        return message;
    }
}
