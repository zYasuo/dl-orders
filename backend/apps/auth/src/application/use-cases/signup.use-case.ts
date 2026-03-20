import { ConflictException, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { OtpCodeEntity } from '../../domain/entities/otp-code.entity';
import { AuthUserRepositoryPort } from '../../domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../domain/ports/security/email-encrypted.port';
import { OtpRepositoryPort } from '../../domain/ports/repositories/otp-repository.port';
import { OtpSendRequestedPublisherPort } from '../../domain/ports/publishers/otp-send-requested-publisher.port';
import { PasswordHasherPort } from '../../domain/ports/security/password-hasher.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { TSignup } from '../dto/signup.dto';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly emailEncrypted: EmailEncryptedSecurity,
    private readonly otpRepository: OtpRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly otpSendRequestedPublisher: OtpSendRequestedPublisherPort,
  ) {}

  async execute(input: TSignup): Promise<{ userId: string; email: string }> {
    const { email, password, name } = input;

    const emailLookupHash = await this.emailEncrypted.getLookupHash(email);
    const existing = await this.authUserRepository.findByEmailLookupHash(emailLookupHash);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const [emailEncrypted, passwordHash] = await Promise.all([
      this.emailEncrypted.encrypt(email),
      this.passwordHasher.hash(password),
    ]);

    const user = await this.authUserRepository.create(
      UserEntity.create({
        emailEncrypted,
        emailLookupHash,
        passwordHash,
        name: name ?? null,
      }),
    );

    if (!user) {
      throw new Error('Failed to create user');
    }

    const code = OtpCodeEntity.generateCode();
    const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? '10', 10);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await this.otpRepository.create(
      new OtpCodeEntity({
        id: crypto.randomUUID(),
        code,
        userId: user.id,
        expiresAt,
        used: false,
        createdAt: new Date(),
      }),
    );

    await this.otpSendRequestedPublisher.publish({
      email,
      code,
      expiresInMinutes,
    });

    return { userId: user.id, email };
  }
}

