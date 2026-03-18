import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SigninUseCase } from '../../../src/application/use-cases/signin.use-case';
import { ValidateAuthAttemptUseCase } from '../../../src/application/use-cases/validate-auth-attempt.use-case';
import { IAccountLockedNotifyPublisherPort } from '../../../src/domain/ports/publishers/account-locked-notify-publisher.port';
import { IAuthLogsRepositoryPort } from '../../../src/domain/ports/repositories/auth-logs-repository.port';
import { IAuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { IEmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.security';
import { IJwtPort } from '../../../src/domain/ports/security/jwt.port';
import { ILockoutStorePort } from '../../../src/domain/ports/stores/lockout-store.port';
import { IPasswordHasherPort } from '../../../src/domain/ports/security/password-hasher.port';
import { ISessionStorePort } from '../../../src/domain/ports/stores/session-store.port';
import { Argon2PasswordHasher } from '../../../src/infrastructure/outbound/security/argon2-password-hasher.security';
import { FakeAccountLockedNotifyPublisher } from '../../doubles/fake-account-locked-notify.publisher';
import { FakeEmailEncryptedSecurity } from '../../doubles/fake-email-encrypted.security';
import { FakeJwtPort } from '../../doubles/fake-jwt.port';
import { InMemoryAuthLogsRepository } from '../../doubles/in-memory-auth-logs.repository';
import { InMemoryAuthUserRepository } from '../../doubles/in-memory-auth-user.repository';
import { InMemoryLockoutStore } from '../../doubles/in-memory-lockout-store';
import { InMemorySessionStore } from '../../doubles/in-memory-session-store';

describe('SigninUseCase (integration)', () => {
  let sut: SigninUseCase;
  let authUserRepository: InMemoryAuthUserRepository;
  let lockoutStore: InMemoryLockoutStore;
  let authLogsRepository: InMemoryAuthLogsRepository;
  let accountLockedNotifyPublisher: FakeAccountLockedNotifyPublisher;
  let jwtPort: FakeJwtPort;
  let sessionStore: InMemorySessionStore;

  beforeEach(async () => {
    authUserRepository = new InMemoryAuthUserRepository();
    lockoutStore = new InMemoryLockoutStore();
    sessionStore = new InMemorySessionStore();
    authLogsRepository = new InMemoryAuthLogsRepository();
    accountLockedNotifyPublisher = new FakeAccountLockedNotifyPublisher();
    jwtPort = new FakeJwtPort();
    const passwordHasher = new Argon2PasswordHasher();

    const validateAuthAttempt = new ValidateAuthAttemptUseCase(
      lockoutStore,
      authLogsRepository,
      accountLockedNotifyPublisher,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninUseCase,
        { provide: IAuthUserRepositoryPort, useValue: authUserRepository },
        { provide: ILockoutStorePort, useValue: lockoutStore },
        { provide: IAuthLogsRepositoryPort, useValue: authLogsRepository },
        {
          provide: IAccountLockedNotifyPublisherPort,
          useValue: accountLockedNotifyPublisher,
        },
        { provide: IEmailEncryptedSecurity, useClass: FakeEmailEncryptedSecurity },
        { provide: IPasswordHasherPort, useValue: passwordHasher },
        { provide: IJwtPort, useValue: jwtPort },
        { provide: ISessionStorePort, useValue: sessionStore },
        { provide: ValidateAuthAttemptUseCase, useValue: validateAuthAttempt },
      ],
    }).compile();

    sut = module.get(SigninUseCase);
  });

  describe('execute', () => {
    it('returns accessToken when user exists, is verified and password matches', async () => {
      const password = 'password123';
      const hash = await new Argon2PasswordHasher().hash(password);
      const user = await authUserRepository.create({
        emailEncrypted: 'user@test.com',
        emailLookupHash: 'user@test.com',
        passwordHash: hash,
        name: 'User',
      });
      await authUserRepository.markEmailVerified(user!.id);

      const result = await sut.execute({ email: 'user@test.com', password });

      expect(result.accessToken).toBe(`fake-jwt-${user!.id}`);
    });

    it('throws BadRequestException when user is not found', async () => {
      await expect(sut.execute({ email: 'unknown@test.com', password: 'any' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'unknown@test.com', password: 'any' })).rejects.toThrow(
        'Authentication Error',
      );
    });

    it('throws BadRequestException when email is not verified', async () => {
      const password = 'password123';
      const hash = await new Argon2PasswordHasher().hash(password);
      await authUserRepository.create({
        emailEncrypted: 'user@test.com',
        emailLookupHash: 'user@test.com',
        passwordHash: hash,
        name: 'User',
      });

      await expect(sut.execute({ email: 'user@test.com', password })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'user@test.com', password })).rejects.toThrow(
        /Email not verified/,
      );
    });

    it('throws BadRequestException when password is invalid', async () => {
      const hash = await new Argon2PasswordHasher().hash('correct');
      const user = await authUserRepository.create({
        emailEncrypted: 'user@test.com',
        emailLookupHash: 'user@test.com',
        passwordHash: hash,
        name: 'User',
      });
      await authUserRepository.markEmailVerified(user!.id);

      await expect(sut.execute({ email: 'user@test.com', password: 'wrong' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'user@test.com', password: 'wrong' })).rejects.toThrow(
        'Authentication Error',
      );
    });

    it('throws ForbiddenException when account is locked after 3 failed attempts', async () => {
      const password = 'password123';
      const hash = await new Argon2PasswordHasher().hash(password);
      const user = await authUserRepository.create({
        emailEncrypted: 'user@test.com',
        emailLookupHash: 'user@test.com',
        passwordHash: hash,
        name: 'User',
      });
      await authUserRepository.markEmailVerified(user!.id);

      await sut.execute({ email: 'user@test.com', password: 'wrong1' }).catch(() => {});
      await sut.execute({ email: 'user@test.com', password: 'wrong2' }).catch(() => {});
      await sut.execute({ email: 'user@test.com', password: 'wrong3' }).catch(() => {});

      await expect(sut.execute({ email: 'user@test.com', password })).rejects.toThrow(
        ForbiddenException,
      );
      await expect(sut.execute({ email: 'user@test.com', password })).rejects.toThrow(
        /Account temporarily locked/,
      );
      expect(accountLockedNotifyPublisher.published).toHaveLength(1);
      expect(accountLockedNotifyPublisher.published[0].email).toBe('user@test.com');
    });
  });
});
