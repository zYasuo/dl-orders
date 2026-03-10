import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuthUserRepositoryPort } from '../../domain/ports/auth-user-repository.port';
import { IEmailEncryptedSecurity } from '../../domain/ports/email-encrypted.security';
import { IJwtPort } from '../../domain/ports/jwt.port';
import { IPasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { ValidateAuthAttemptUseCase } from './validate-auth-attempt.use-case';
import { TSignin } from '../dto/signin.dto';

@Injectable()
export class SigninUseCase {
    constructor(
        private readonly authUserRepository: IAuthUserRepositoryPort,
        private readonly emailEncrypted: IEmailEncryptedSecurity,
        private readonly passwordHasher: IPasswordHasherPort,
        private readonly jwtPort: IJwtPort,
        private readonly validateAuthAttempt: ValidateAuthAttemptUseCase,
    ) {}

    async execute(input: TSignin): Promise<{ accessToken: string }> {
        const { email, password, ip } = input;

        const emailLookupHash = await this.emailEncrypted.getLookupHash(email);
        const user = await this.authUserRepository.findByEmailLookupHash(emailLookupHash);

        if (!user) {
            throw new BadRequestException('Authentication Error');
        }

        if (!user.emailVerified) {
            throw new BadRequestException('Email not verified. Please verify with the OTP sent to your email.');
        }

        await this.validateAuthAttempt.validateBeforeLogin(user.id);

        const valid = await this.passwordHasher.compare(password, user.passwordHash);

        if (!valid) {
            const plainEmail = await this.emailEncrypted.decrypt(user.emailEncrypted);
            await this.validateAuthAttempt.registerFailedAttempt(user.id, ip ?? null, plainEmail);
            
            throw new BadRequestException('Authentication Error');
        }

        await this.validateAuthAttempt.registerSuccessfulLogin(user.id, ip ?? null);

        const plainEmail = await this.emailEncrypted.decrypt(user.emailEncrypted);
        const accessToken = await this.jwtPort.sign({
            sub: user.id,
            email: plainEmail,
        });

        return { accessToken };
    }
}
