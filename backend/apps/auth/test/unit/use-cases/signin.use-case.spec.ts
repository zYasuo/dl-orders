import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SigninUseCase } from '../../../src/application/use-cases/signin.use-case';
import { ValidateAuthAttemptUseCase } from '../../../src/application/use-cases/validate-auth-attempt.use-case';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { AuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.port';
import { JwtPort } from '../../../src/domain/ports/security/jwt.port';
import { PasswordHasherPort } from '../../../src/domain/ports/security/password-hasher.port';
import { SessionStorePort } from '../../../src/domain/ports/stores/session-store.port';

describe('SigninUseCase', () => {
  let sut: SigninUseCase;
  let authUserRepository: jest.Mocked<AuthUserRepositoryPort>;
  let emailEncrypted: jest.Mocked<EmailEncryptedSecurity>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let jwtPort: jest.Mocked<JwtPort>;
  let sessionStore: jest.Mocked<SessionStorePort>;
  let validateAuthAttempt: jest.Mocked<ValidateAuthAttemptUseCase>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const verifiedUser = new UserEntity({
    id: 'user-123',
    emailEncrypted: 'enc-user@test.com',
    emailLookupHash: 'user@test.com',
    passwordHash: 'hashed',
    name: 'User',
    emailVerified: true,
    createdAt,
    updatedAt: createdAt,
  });

  const unverifiedUser = new UserEntity({
    id: 'user-123',
    emailEncrypted: 'enc-user@test.com',
    emailLookupHash: 'user@test.com',
    passwordHash: 'hashed',
    name: 'User',
    emailVerified: false,
    createdAt,
    updatedAt: createdAt,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    authUserRepository = {
      create: jest.fn(),
      findByEmailLookupHash: jest.fn().mockResolvedValue(verifiedUser),
      markEmailVerified: jest.fn(),
    } as unknown as jest.Mocked<AuthUserRepositoryPort>;

    emailEncrypted = {
      encrypt: jest.fn().mockImplementation((v: string) => Promise.resolve(v)),
      decrypt: jest.fn().mockImplementation((v: string) => Promise.resolve(v)),
      getLookupHash: jest
        .fn()
        .mockImplementation((v: string) => Promise.resolve(v.toLowerCase().trim())),
    } as unknown as jest.Mocked<EmailEncryptedSecurity>;

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<PasswordHasherPort>;

    jwtPort = {
      sign: jest.fn().mockResolvedValue('jwt-token'),
      verify: jest.fn(),
      getExpiresInSeconds: jest.fn().mockReturnValue(86400),
    } as unknown as jest.Mocked<JwtPort>;

    sessionStore = {
      set: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SessionStorePort>;

    validateAuthAttempt = {
      validateBeforeLogin: jest.fn().mockResolvedValue(undefined),
      registerFailedAttempt: jest.fn().mockResolvedValue(undefined),
      registerSuccessfulLogin: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ValidateAuthAttemptUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninUseCase,
        { provide: AuthUserRepositoryPort, useValue: authUserRepository },
        { provide: EmailEncryptedSecurity, useValue: emailEncrypted },
        { provide: PasswordHasherPort, useValue: passwordHasher },
        { provide: JwtPort, useValue: jwtPort },
        { provide: SessionStorePort, useValue: sessionStore },
        { provide: ValidateAuthAttemptUseCase, useValue: validateAuthAttempt },
      ],
    }).compile();

    sut = module.get(SigninUseCase);
  });

  describe('execute', () => {
    it('returns accessToken when credentials and email are verified', async () => {
      const input = { email: 'user@test.com', password: 'password123' };

      const result = await sut.execute(input);

      expect(emailEncrypted.getLookupHash).toHaveBeenCalledWith(input.email);
      expect(authUserRepository.findByEmailLookupHash).toHaveBeenCalledWith(input.email);

      expect(validateAuthAttempt.validateBeforeLogin).toHaveBeenCalledWith(verifiedUser.id);

      expect(passwordHasher.compare).toHaveBeenCalledWith(
        input.password,
        verifiedUser.passwordHash,
      );

      expect(validateAuthAttempt.registerSuccessfulLogin).toHaveBeenCalledWith(
        verifiedUser.id,
        null,
      );

      expect(emailEncrypted.decrypt).toHaveBeenCalledWith(verifiedUser.emailEncrypted);

      expect(jwtPort.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: verifiedUser.id,
          email: verifiedUser.emailEncrypted,
          jti: expect.any(String),
        }),
      );

      const signPayload = (jwtPort.sign as jest.Mock).mock.calls[0][0];
      expect(sessionStore.set).toHaveBeenCalledWith(
        signPayload.jti,
        { sub: verifiedUser.id, email: verifiedUser.emailEncrypted },
        86400,
      );

      expect(result).toEqual({ accessToken: 'jwt-token' });
    });

    it('throws ForbiddenException when account is locked', async () => {
      validateAuthAttempt.validateBeforeLogin.mockRejectedValueOnce(
        new ForbiddenException('Account temporarily locked.'),
      );
      const input = { email: 'user@test.com', password: 'password123' };

      await expect(sut.execute(input)).rejects.toThrow(ForbiddenException);
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
      expect(sessionStore.set).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when user is not found', async () => {
      authUserRepository.findByEmailLookupHash.mockResolvedValueOnce(null);
      const input = { email: 'unknown@test.com', password: 'password123' };

      await expect(sut.execute(input)).rejects.toThrow('Authentication Error');

      expect(validateAuthAttempt.validateBeforeLogin).not.toHaveBeenCalled();
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
      expect(sessionStore.set).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when email is not verified', async () => {
      authUserRepository.findByEmailLookupHash.mockResolvedValueOnce(unverifiedUser);

      const input = { email: 'user@test.com', password: 'password123' };

      await expect(sut.execute(input)).rejects.toThrow(/Email not verified/);

      expect(validateAuthAttempt.validateBeforeLogin).not.toHaveBeenCalled();
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(jwtPort.sign).not.toHaveBeenCalled();
      expect(sessionStore.set).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when password is invalid and calls registerFailedAttempt', async () => {
      passwordHasher.compare.mockResolvedValueOnce(false);
      emailEncrypted.decrypt.mockResolvedValueOnce('user@test.com');
      const input = { email: 'user@test.com', password: 'wrongpassword' };

      await expect(sut.execute(input)).rejects.toThrow('Authentication Error');

      expect(validateAuthAttempt.registerFailedAttempt).toHaveBeenCalledWith(
        verifiedUser.id,
        null,
        'user@test.com',
      );

      expect(jwtPort.sign).not.toHaveBeenCalled();
      expect(sessionStore.set).not.toHaveBeenCalled();
    });
  });
});

