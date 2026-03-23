import { Test, TestingModule } from '@nestjs/testing';
import { VerifyOtpUseCase } from '../../../src/application/use-cases/verify-otp.use-case';
import { OtpCodeEntity } from '../../../src/domain/entities/otp-code.entity';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { AuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.port';
import { JwtPort } from '../../../src/domain/ports/security/jwt.port';
import { OtpRepositoryPort } from '../../../src/domain/ports/repositories/otp-repository.port';
import { UserVerifiedPublisherPort } from '../../../src/domain/ports/publishers/user-verified-publisher.port';
import { UserProfileProvisionerPort } from '../../../src/domain/ports/user-profile-provisioner.port';

describe('VerifyOtpUseCase', () => {
  let sut: VerifyOtpUseCase;
  let authUserRepository: jest.Mocked<AuthUserRepositoryPort>;
  let emailEncrypted: jest.Mocked<EmailEncryptedSecurity>;
  let otpRepository: jest.Mocked<OtpRepositoryPort>;
  let jwtPort: jest.Mocked<JwtPort>;
  let userVerifiedPublisher: jest.Mocked<UserVerifiedPublisherPort>;
  let userProfileProvisioner: jest.Mocked<UserProfileProvisionerPort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const futureExpiry = new Date(Date.now() + 10 * 60 * 1000);
  const pastExpiry = new Date(Date.now() - 60 * 1000);

  const fakeUser = new UserEntity({
    id: 'user-123',
    emailEncrypted: 'enc-user@test.com',
    emailLookupHash: 'user@test.com',
    passwordHash: 'hashed',
    name: 'User Name',
    emailVerified: false,
    createdAt,
    updatedAt: createdAt,
  });

  const verifiedUserInstance = new UserEntity({
    id: fakeUser.id,
    emailEncrypted: fakeUser.emailEncrypted,
    emailLookupHash: fakeUser.emailLookupHash,
    passwordHash: fakeUser.passwordHash,
    name: fakeUser.name,
    emailVerified: true,
    createdAt,
    updatedAt: createdAt,
  });

  const validOtp = new OtpCodeEntity({
    id: 'otp-1',
    code: '123456',
    userId: fakeUser.id,
    expiresAt: futureExpiry,
    used: false,
    createdAt,
  });

  const usedOtp = new OtpCodeEntity({
    id: 'otp-1',
    code: '123456',
    userId: fakeUser.id,
    expiresAt: futureExpiry,
    used: true,
    createdAt,
  });

  const expiredOtp = new OtpCodeEntity({
    id: 'otp-1',
    code: '123456',
    userId: fakeUser.id,
    expiresAt: pastExpiry,
    used: false,
    createdAt,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    authUserRepository = {
      create: jest.fn(),
      findByEmailLookupHash: jest.fn().mockResolvedValue(fakeUser),
      markEmailVerified: jest.fn().mockResolvedValue(verifiedUserInstance),
    } as unknown as jest.Mocked<AuthUserRepositoryPort>;

    emailEncrypted = {
      encrypt: jest.fn().mockImplementation((v: string) => Promise.resolve(v)),
      decrypt: jest.fn().mockImplementation((v: string) => Promise.resolve(v)),
      getLookupHash: jest
        .fn()
        .mockImplementation((v: string) => Promise.resolve(v.toLowerCase().trim())),
    } as unknown as jest.Mocked<EmailEncryptedSecurity>;

    otpRepository = {
      create: jest.fn(),
      findLatestByUserId: jest.fn().mockResolvedValue(validOtp),
      markUsedIfUnused: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<OtpRepositoryPort>;

    jwtPort = {
      sign: jest.fn().mockResolvedValue('jwt-token'),
      verify: jest.fn(),
      getExpiresInSeconds: jest.fn().mockReturnValue(86400),
    } as unknown as jest.Mocked<JwtPort>;

    userVerifiedPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserVerifiedPublisherPort>;

    userProfileProvisioner = {
      provision: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserProfileProvisionerPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyOtpUseCase,
        { provide: AuthUserRepositoryPort, useValue: authUserRepository },
        { provide: EmailEncryptedSecurity, useValue: emailEncrypted },
        { provide: OtpRepositoryPort, useValue: otpRepository },
        { provide: JwtPort, useValue: jwtPort },
        { provide: UserVerifiedPublisherPort, useValue: userVerifiedPublisher },
        { provide: UserProfileProvisionerPort, useValue: userProfileProvisioner },
      ],
    }).compile();

    sut = module.get(VerifyOtpUseCase);
  });

  describe('execute', () => {
    it('marks OTP used, marks user verified, provisions profile, publishes event and returns accessToken', async () => {
      const input = { email: 'user@test.com', code: '123456' };

      const result = await sut.execute(input);

      expect(emailEncrypted.getLookupHash).toHaveBeenCalledWith(input.email);
      expect(authUserRepository.findByEmailLookupHash).toHaveBeenCalledWith(input.email);
      expect(otpRepository.findLatestByUserId).toHaveBeenCalledWith(fakeUser.id);
      expect(otpRepository.markUsedIfUnused).toHaveBeenCalledWith(validOtp.id);
      expect(authUserRepository.markEmailVerified).toHaveBeenCalledWith(fakeUser.id);
      expect(userProfileProvisioner.provision).toHaveBeenCalledWith({
        userId: verifiedUserInstance.id,
        email: input.email,
        name: verifiedUserInstance.name,
      });
      expect(userVerifiedPublisher.publish).toHaveBeenCalledWith({
        userId: verifiedUserInstance.id,
        email: input.email,
        name: verifiedUserInstance.name,
      });
      expect(jwtPort.sign).toHaveBeenCalledWith({ sub: fakeUser.id, email: input.email });
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });

    it('throws BadRequestException when user is not found', async () => {
      authUserRepository.findByEmailLookupHash.mockResolvedValueOnce(null);
      const input = { email: 'unknown@test.com', code: '123456' };

      await expect(sut.execute(input)).rejects.toThrow(/Invalid email or code/);

      expect(otpRepository.findLatestByUserId).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when OTP is not found', async () => {
      otpRepository.findLatestByUserId.mockResolvedValueOnce(null);
      const input = { email: 'user@test.com', code: '123456' };

      await expect(sut.execute(input)).rejects.toThrow(/Invalid email or code/);

      expect(otpRepository.markUsedIfUnused).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when code does not match', async () => {
      const input = { email: 'user@test.com', code: '999999' };

      await expect(sut.execute(input)).rejects.toThrow(/Invalid email or code/);

      expect(otpRepository.markUsedIfUnused).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when code was already used', async () => {
      otpRepository.findLatestByUserId.mockResolvedValueOnce(usedOtp);
      otpRepository.markUsedIfUnused.mockResolvedValueOnce(false);
      const input = { email: 'user@test.com', code: '123456' };

      await expect(sut.execute(input)).rejects.toThrow(/Code already used/);

      expect(otpRepository.markUsedIfUnused).toHaveBeenCalledWith(usedOtp.id);
      expect(jwtPort.sign).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when code is expired', async () => {
      otpRepository.findLatestByUserId.mockResolvedValueOnce(expiredOtp);
      const input = { email: 'user@test.com', code: '123456' };

      await expect(sut.execute(input)).rejects.toThrow(/Code expired/);

      expect(otpRepository.markUsedIfUnused).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
    });
  });
});

