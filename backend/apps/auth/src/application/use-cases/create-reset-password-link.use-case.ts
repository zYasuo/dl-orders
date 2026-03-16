import { Injectable } from '@nestjs/common';
import { IPasswordResetRepositoryPort } from '../../domain/ports/repositories/password-reset-repository.port';
import { TCreateResetPasswordLink } from '../dto/create-reset-password-link.dto';
import { IEmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.security';
import { PasswordResetEntity } from '../../domain/entities/password-reset.entity';
import { TCreatePasswordReset } from '../../domain/types/password-repository.type';
import { IResetPasswordPublisherPort } from '../../domain/ports/publishers/reset-password-publisher.port';

@Injectable()
export class CreateResetPasswordLinkUseCase {
    constructor(
        private readonly passwordResetRepository: IPasswordResetRepositoryPort,
        private readonly emailEncrypted: IEmailEncryptedSecurity,
        private readonly resetPasswordPublisher: IResetPasswordPublisherPort,
    ) {}

    async execute(input: TCreateResetPasswordLink): Promise<{ message: string }> {
        const { email } = input;

        const token = PasswordResetEntity.generateToken();
        const expiresAt = PasswordResetEntity.expiresAtFromNow();

        const message = 'If this email addres is registered, you will receive a reset password link in a few minutes.';
        
        const [linkResetPassword, emailLookupHash] = await Promise.all([
            this.createLinkResetPassword(token),
            this.emailEncrypted.getLookupHash(email),
        ]);

        const [existing, emailEncrypted] = await Promise.all([
            this.passwordResetRepository.findByEmailLookupHash(emailLookupHash),
            this.emailEncrypted.encrypt(email),
        ]);

        if (existing && !PasswordResetEntity.isExpired(existing.expiresAt) && !PasswordResetEntity.isUsed(existing.used)) {
            return { message };
        }

        const createData: TCreatePasswordReset = {
            emailEncrypted,
            emailLookupHash,
            linkResetPassword,
            expiresAt,
        };

        await Promise.all([
            this.passwordResetRepository.create(createData),
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
