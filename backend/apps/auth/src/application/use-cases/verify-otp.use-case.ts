import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUserRepositoryPort } from '../../domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.port';
import { JwtPort } from '../../domain/ports/security/jwt.port';
import { OtpRepositoryPort } from '../../domain/ports/repositories/otp-repository.port';
import { UserVerifiedPublisherPort } from '../../domain/ports/publishers/user-verified-publisher.port';
import { UserProfileProvisionerPort } from '../../domain/ports/user-profile-provisioner.port';
import { TVerifyOtp } from '../dto/verify-otp.dto';

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly emailEncrypted: EmailEncryptedSecurity,
    private readonly otpRepository: OtpRepositoryPort,
    private readonly jwtPort: JwtPort,
    private readonly userVerifiedPublisher: UserVerifiedPublisherPort,
    private readonly userProfileProvisioner: UserProfileProvisionerPort,
  ) {}

  async execute(input: TVerifyOtp): Promise<{ accessToken: string }> {
    const emailLookupHash = await this.emailEncrypted.getLookupHash(input.email);
    const user = await this.authUserRepository.findByEmailLookupHash(emailLookupHash);

    if (!user) {
      throw new BadRequestException('Invalid email or code');
    }

    const otp = await this.otpRepository.findLatestByUserId(user.id);

    if (!otp || otp.code !== input.code) {
      throw new BadRequestException('Invalid email or code');
    }

    if (otp.isExpired()) {
      throw new BadRequestException('Code expired');
    }

    const marked = await this.otpRepository.markUsedIfUnused(otp.id);

    if (!marked) {
      throw new BadRequestException('Code already used');
    }

    const verifiedUser = await this.authUserRepository.markEmailVerified(user.id);

    if (verifiedUser) {
      const verifiedPayload = {
        userId: verifiedUser.id,
        email: input.email,
        name: verifiedUser.name,
      };

      await this.userProfileProvisioner.provision(verifiedPayload);
      await this.userVerifiedPublisher.publish(verifiedPayload);
      
    }

    const accessToken = await this.jwtPort.sign({
      sub: user.id,
      email: input.email,
    });

    return { accessToken };
  }
}

