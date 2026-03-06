import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuthUserRepositoryPort } from '../../domain/ports/auth-user-repository.port';
import { IJwtPort } from '../../domain/ports/jwt.port';
import { IOtpRepositoryPort } from '../../domain/ports/otp-repository.port';
import { IUserVerifiedPublisherPort } from '../../domain/ports/user-verified-publisher.port';
import { TVerifyOtp } from '../dto/verify-otp.dto';

@Injectable()
export class VerifyOtpUseCase {
    constructor(
        private readonly authUserRepository: IAuthUserRepositoryPort,
        private readonly otpRepository: IOtpRepositoryPort,
        private readonly jwtPort: IJwtPort,
        private readonly userVerifiedPublisher: IUserVerifiedPublisherPort,
    ) {}

    async execute(input: TVerifyOtp): Promise<{ accessToken: string }> {
        const user = await this.authUserRepository.findByEmail(input.email);
        if (!user) {
            throw new BadRequestException('Invalid email or code');
        }

        const otp = await this.otpRepository.findLatestByUserId(user.id);
        if (!otp || otp.code !== input.code) {
            throw new BadRequestException('Invalid email or code');
        }
        if (otp.used) {
            throw new BadRequestException('Code already used');
        }
        if (otp.isExpired()) {
            throw new BadRequestException('Code expired');
        }

        await this.otpRepository.markUsed(otp.id);
        const verifiedUser = await this.authUserRepository.markEmailVerified(user.id);
        if (verifiedUser) {
            await this.userVerifiedPublisher.publish({
                userId: verifiedUser.id,
                email: verifiedUser.email,
                name: verifiedUser.name,
            });
        }

        const accessToken = await this.jwtPort.sign({
            sub: user.id,
            email: user.email,
        });

        return { accessToken };
    }
}
