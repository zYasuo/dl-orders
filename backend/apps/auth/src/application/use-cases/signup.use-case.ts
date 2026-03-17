import { ConflictException, Injectable } from '@nestjs/common';
import { OtpCodeEntity } from '../../domain/entities/otp-code.entity';
import { IAuthUserRepositoryPort } from '../../domain/ports/repositories/auth-user-repository.port';
import { IEmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.security';
import { IOtpRepositoryPort } from '../../domain/ports/repositories/otp-repository.port';
import { IOtpSendRequestedPublisherPort } from '../../domain/ports/publishers/otp-send-requested-publisher.port';
import { IPasswordHasherPort } from '../../domain/ports/security/password-hasher.port';
import { TCreateAuthUser } from '../../domain/types/auth-user-repository.types';
import { TCreateOtp } from '../../domain/types/otp-repository.types';
import { TSignup } from '../dto/signup.dto';

@Injectable()
export class SignupUseCase {
    constructor(
        private readonly authUserRepository: IAuthUserRepositoryPort,
        private readonly emailEncrypted: IEmailEncryptedSecurity,
        private readonly otpRepository: IOtpRepositoryPort,
        private readonly passwordHasher: IPasswordHasherPort,
        private readonly otpSendRequestedPublisher: IOtpSendRequestedPublisherPort,
    ) {}

    async execute(input: TSignup): Promise<{ userId: string; email: string }> {
        const { email, password, name } = input;

        const emailLookupHash = await this.emailEncrypted.getLookupHash(email);
        const existing = await this.authUserRepository.findByEmailLookupHash(emailLookupHash);

        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const [emailEncrypted, passwordHash] = await Promise.all([this.emailEncrypted.encrypt(email), this.passwordHasher.hash(password)]);

        const createData: TCreateAuthUser = {
            emailEncrypted,
            emailLookupHash,
            passwordHash,
            name: name ?? null,
        };

        const user = await this.authUserRepository.create(createData);

        if (!user) {
            throw new Error('Failed to create user');
        }

        const code = OtpCodeEntity.generateCode();
        const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? '10', 10);
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        const otpData: TCreateOtp = { code, userId: user.id, expiresAt };

        await this.otpRepository.create(otpData);

        await this.otpSendRequestedPublisher.publish({
            email,
            code,
            expiresInMinutes,
        });

        return { userId: user.id, email };
    }
}
