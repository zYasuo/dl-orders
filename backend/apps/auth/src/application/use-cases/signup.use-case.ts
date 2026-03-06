import { ConflictException, Injectable } from '@nestjs/common';
import { IAuthUserRepositoryPort } from '../../domain/ports/auth-user-repository.port';
import { IOtpRepositoryPort } from '../../domain/ports/otp-repository.port';
import { IOtpSendRequestedPublisherPort } from '../../domain/ports/otp-send-requested-publisher.port';
import { IPasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { TCreateAuthUser } from '../../domain/types/auth-user-repository.types';
import { TCreateOtp } from '../../domain/types/otp-repository.types';
import { TSignup } from '../dto/signup.dto';

@Injectable()
export class SignupUseCase {
    constructor(
        private readonly authUserRepository: IAuthUserRepositoryPort,
        private readonly otpRepository: IOtpRepositoryPort,
        private readonly passwordHasher: IPasswordHasherPort,
        private readonly otpSendRequestedPublisher: IOtpSendRequestedPublisherPort,
    ) {}

    async execute(input: TSignup): Promise<{ userId: string; email: string }> {
        const { email, password, name } = input;
        const existing = await this.authUserRepository.findByEmail(email);

        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await this.passwordHasher.hash(password);

        const createData: TCreateAuthUser = {
            email,
            passwordHash,
            name: name ?? null,
        };

        const user = await this.authUserRepository.create(createData);

        if (!user) {
            throw new Error('Failed to create user');
        }

        const code = this.generateOtpCode();
        const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? '10', 10);
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        const otpData: TCreateOtp = { code, userId: user.id, expiresAt };

        await this.otpRepository.create(otpData);

        await this.otpSendRequestedPublisher.publish({
            email,
            code,
            expiresInMinutes,
        });

        return { userId: user.id, email: user.email };
    }

    private generateOtpCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
