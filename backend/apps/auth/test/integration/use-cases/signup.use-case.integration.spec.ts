import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignupUseCase } from '../../../src/application/use-cases/signup.use-case';
import { AuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.port';
import { OtpRepositoryPort } from '../../../src/domain/ports/repositories/otp-repository.port';
import { OtpSendRequestedPublisherPort } from '../../../src/domain/ports/publishers/otp-send-requested-publisher.port';
import { PasswordHasherPort } from '../../../src/domain/ports/security/password-hasher.port';
import { Argon2PasswordHasher } from '../../../src/infrastructure/outbound/security/argon2-password-hasher.security';
import { FakeEmailEncryptedSecurity } from '../../doubles/fake-email-encrypted.security';
import { FakeOtpSendRequestedPublisher } from '../../doubles/fake-otp-send-requested.publisher';
import { InMemoryAuthUserRepository } from '../../doubles/in-memory-auth-user.repository';
import { InMemoryOtpRepository } from '../../doubles/in-memory-otp.repository';

describe('SignupUseCase (integration)', () => {
  let sut: SignupUseCase;
  let authUserRepository: InMemoryAuthUserRepository;
  let otpRepository: InMemoryOtpRepository;
  let otpSendRequestedPublisher: FakeOtpSendRequestedPublisher;

  beforeEach(async () => {
    process.env.OTP_EXPIRES_IN_MINUTES = '10';
    authUserRepository = new InMemoryAuthUserRepository();
    otpRepository = new InMemoryOtpRepository();
    otpSendRequestedPublisher = new FakeOtpSendRequestedPublisher();
    const passwordHasher = new Argon2PasswordHasher();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupUseCase,
        { provide: AuthUserRepositoryPort, useValue: authUserRepository },
        { provide: EmailEncryptedSecurity, useClass: FakeEmailEncryptedSecurity },
        { provide: OtpRepositoryPort, useValue: otpRepository },
        { provide: PasswordHasherPort, useValue: passwordHasher },
        { provide: OtpSendRequestedPublisherPort, useValue: otpSendRequestedPublisher },
      ],
    }).compile();

    sut = module.get(SignupUseCase);
  });

  describe('execute', () => {
    it('creates user, OTP and publishes OTP send event', async () => {
      const input = { email: 'user@test.com', password: 'password1234', name: 'User Name' };

      const result = await sut.execute(input);

      expect(result.email).toBe(input.email);
      expect(result.userId).toBeDefined();

      const user = await authUserRepository.findByEmailLookupHash(input.email);
      expect(user).not.toBeNull();
      expect(user!.name).toBe(input.name);
      expect(user!.emailVerified).toBe(false);
      expect(user!.passwordHash).not.toBe(input.password);

      const otp = await otpRepository.findLatestByUserId(result.userId);
      expect(otp).not.toBeNull();
      expect(otp!.code).toHaveLength(6);
      expect(otp!.used).toBe(false);

      expect(otpSendRequestedPublisher.published).toHaveLength(1);
      expect(otpSendRequestedPublisher.published[0].email).toBe(input.email);
      expect(otpSendRequestedPublisher.published[0].code).toBe(otp!.code);
    });

    it('throws ConflictException when email is already registered', async () => {
      const input = { email: 'user@test.com', password: 'password1234', name: 'User' };
      await sut.execute(input);

      await expect(sut.execute(input)).rejects.toThrow(ConflictException);
      await expect(sut.execute(input)).rejects.toThrow(/Registration failed/);
    });
  });
});
