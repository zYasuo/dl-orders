import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuthUserRepositoryPort } from '../../domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.port';
import { JwtPort } from '../../domain/ports/security/jwt.port';
import { PasswordHasherPort } from '../../domain/ports/security/password-hasher.port';
import { SessionStorePort } from '../../domain/ports/stores/session-store.port';
import { UserProfileProvisionerPort } from '../../domain/ports/user-profile-provisioner.port';
import { TSignin } from '../dto/signin.dto';
import { ValidateAuthAttemptUseCase } from './validate-auth-attempt.use-case';

@Injectable()
export class SigninUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly emailEncrypted: EmailEncryptedSecurity,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly jwtPort: JwtPort,
    private readonly sessionStore: SessionStorePort,
    private readonly validateAuthAttempt: ValidateAuthAttemptUseCase,
    private readonly userProfileProvisioner: UserProfileProvisionerPort,
  ) {}

  async execute(input: TSignin): Promise<{ accessToken: string }> {
    const { email, password, ip } = input;

    const emailLookupHash = await this.emailEncrypted.getLookupHash(email);
    const user = await this.authUserRepository.findByEmailLookupHash(emailLookupHash);

    if (!user) {
      throw new BadRequestException('Authentication Error');
    }

    if (!user.emailVerified) {
      throw new BadRequestException(
        'Email not verified. Please verify with the OTP sent to your email.',
      );
    }

    await this.validateAuthAttempt.validateBeforeLogin(user.id);

    const valid = await this.passwordHasher.compare(password, user.passwordHash);

    if (!valid) {
      const plainEmail = await this.emailEncrypted.decrypt(user.emailEncrypted);

      await this.validateAuthAttempt.registerFailedAttempt(user.id, ip ?? null, plainEmail);

      throw new BadRequestException('Authentication Error');
    }

    const plainEmail = await this.emailEncrypted.decrypt(user.emailEncrypted);

    await this.validateAuthAttempt.registerSuccessfulLogin(user.id, ip ?? null);

    await this.userProfileProvisioner.provision({
      userId: user.id,
      email: plainEmail,
      name: user.name ?? null,
    });

    const sessionID = randomUUID();
    const accessToken = await this.jwtPort.sign({
      sub: user.id,
      email: plainEmail,
      jti: sessionID,
    });

    const ttlSeconds = this.jwtPort.getExpiresInSeconds();
    await this.sessionStore.set(sessionID, { sub: user.id, email: plainEmail }, ttlSeconds);

    return { accessToken };
  }
}

