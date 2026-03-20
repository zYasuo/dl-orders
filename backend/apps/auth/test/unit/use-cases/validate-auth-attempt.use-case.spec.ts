import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateAuthAttemptUseCase } from '../../../src/application/use-cases/validate-auth-attempt.use-case';
import { AuthLogsEntity } from '../../../src/domain/entities/auth-logs.entity';
import { AccountLockedNotifyPublisherPort } from '../../../src/domain/ports/publishers/account-locked-notify-publisher.port';
import { AuthLogsRepositoryPort } from '../../../src/domain/ports/repositories/auth-logs-repository.port';
import { LockoutStorePort } from '../../../src/domain/ports/stores/lockout-store.port';

describe('ValidateAuthAttemptUseCase', () => {
  let sut: ValidateAuthAttemptUseCase;
  let lockoutStore: jest.Mocked<LockoutStorePort>;
  let authLogsRepository: jest.Mocked<AuthLogsRepositoryPort>;
  let accountLockedNotifyPublisher: jest.Mocked<AccountLockedNotifyPublisherPort>;

  const userId = 'user-123';
  const email = 'user@test.com';
  const now = new Date('2025-01-01T12:00:00Z');

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: now.getTime() });

    lockoutStore = {
      isLocked: jest.fn().mockResolvedValue(false),
      getLockedUntil: jest.fn().mockResolvedValue(null),
      getFailedAttempts: jest.fn().mockResolvedValue(0),
      incrementFailedAttempts: jest.fn().mockResolvedValue({ attempts: 1, shouldLock: false }),
      setLocked: jest.fn().mockResolvedValue(undefined),
      resetOnSuccess: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<LockoutStorePort>;

    authLogsRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
      upsert: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve(
            new AuthLogsEntity(
              'log-id',
              data.userId,
              data.loginAttempts,
              data.lastLoginAttempt,
              data.lastLoginAttemptIp ?? null,
              data.lastLoginAttemptSuccess,
              data.lockedUntil ?? null,
              data.lastLoginAttempt,
            ),
          ),
        ),
    } as unknown as jest.Mocked<AuthLogsRepositoryPort>;

    accountLockedNotifyPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AccountLockedNotifyPublisherPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateAuthAttemptUseCase,
        { provide: LockoutStorePort, useValue: lockoutStore },
        { provide: AuthLogsRepositoryPort, useValue: authLogsRepository },
        {
          provide: AccountLockedNotifyPublisherPort,
          useValue: accountLockedNotifyPublisher,
        },
      ],
    }).compile();

    sut = module.get(ValidateAuthAttemptUseCase);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('validateBeforeLogin', () => {
    it('does nothing when account is not locked', async () => {
      lockoutStore.getLockedUntil.mockResolvedValueOnce(null);

      await expect(sut.validateBeforeLogin(userId)).resolves.not.toThrow();
      expect(lockoutStore.getLockedUntil).toHaveBeenCalledWith(userId);
    });

    it('throws ForbiddenException when account is locked', async () => {
      const lockedUntil = AuthLogsEntity.addMinutesToDate(now, 5);
      lockoutStore.getLockedUntil.mockResolvedValue(lockedUntil);

      await expect(sut.validateBeforeLogin(userId)).rejects.toThrow(ForbiddenException);
      await expect(sut.validateBeforeLogin(userId)).rejects.toThrow(
        /Account temporarily locked.*Try again in \d+ minute/,
      );
      expect(lockoutStore.getLockedUntil).toHaveBeenCalledWith(userId);
    });
  });

  describe('registerFailedAttempt', () => {
    it('increments attempts, upserts audit and does not lock when under max', async () => {
      lockoutStore.incrementFailedAttempts.mockResolvedValueOnce({
        attempts: 1,
        shouldLock: false,
      });

      await sut.registerFailedAttempt(userId, '192.168.1.1', email);

      expect(lockoutStore.incrementFailedAttempts).toHaveBeenCalledWith(userId);
      expect(lockoutStore.setLocked).not.toHaveBeenCalled();
      expect(accountLockedNotifyPublisher.publish).not.toHaveBeenCalled();
      expect(authLogsRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          loginAttempts: 1,
          lastLoginAttemptIp: '192.168.1.1',
          lastLoginAttemptSuccess: false,
          lockedUntil: undefined,
        }),
      );
    });

    it('sets lockout and publishes when attempts reach max', async () => {
      lockoutStore.incrementFailedAttempts.mockResolvedValueOnce({ attempts: 3, shouldLock: true });

      await sut.registerFailedAttempt(userId, null, email);

      expect(lockoutStore.incrementFailedAttempts).toHaveBeenCalledWith(userId);
      expect(lockoutStore.setLocked).toHaveBeenCalledWith(userId, 5);
      expect(accountLockedNotifyPublisher.publish).toHaveBeenCalledTimes(1);
      expect(accountLockedNotifyPublisher.publish).toHaveBeenCalledWith({
        email,
        lockedUntilMinutes: 5,
      });
      expect(authLogsRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          loginAttempts: 0,
          lastLoginAttemptSuccess: false,
          lockedUntil: expect.any(Date),
        }),
      );
    });
  });

  describe('registerSuccessfulLogin', () => {
    it('resets lockout and upserts audit with success', async () => {
      await sut.registerSuccessfulLogin(userId, '10.0.0.1');

      expect(lockoutStore.resetOnSuccess).toHaveBeenCalledWith(userId);
      expect(authLogsRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          loginAttempts: 0,
          lastLoginAttemptIp: '10.0.0.1',
          lastLoginAttemptSuccess: true,
        }),
      );
    });
  });
});
