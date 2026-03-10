import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateAuthAttemptUseCase } from '../../../src/application/use-cases/validate-auth-attempt.use-case';
import { AuthLogs } from '../../../src/domain/entities/auth-logs.entity';
import { IAccountLockedNotifyPublisherPort } from '../../../src/domain/ports/account-locked-notify-publisher.port';
import { IAuthLogsRepositoryPort } from '../../../src/domain/ports/auth-logs-repository.port';
import { addMinutesToDate } from '../../../src/utils/lockout.utils';

describe('ValidateAuthAttemptUseCase', () => {
    let sut: ValidateAuthAttemptUseCase;
    let authLogsRepository: jest.Mocked<IAuthLogsRepositoryPort>;
    let accountLockedNotifyPublisher: jest.Mocked<IAccountLockedNotifyPublisherPort>;

    const userId = 'user-123';
    const email = 'user@test.com';
    const now = new Date('2025-01-01T12:00:00Z');

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.useFakeTimers({ now: now.getTime() });

        authLogsRepository = {
            findByUserId: jest.fn().mockResolvedValue(null),
            upsert: jest
                .fn()
                .mockImplementation((data) =>
                    Promise.resolve(
                        new AuthLogs(
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
        } as unknown as jest.Mocked<IAuthLogsRepositoryPort>;

        accountLockedNotifyPublisher = {
            publish: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IAccountLockedNotifyPublisherPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ValidateAuthAttemptUseCase,
                { provide: IAuthLogsRepositoryPort, useValue: authLogsRepository },
                {
                    provide: IAccountLockedNotifyPublisherPort,
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
        it('does nothing when user has no auth logs', async () => {
            authLogsRepository.findByUserId.mockResolvedValueOnce(null);

            await expect(sut.validateBeforeLogin(userId)).resolves.not.toThrow();
            expect(authLogsRepository.findByUserId).toHaveBeenCalledWith(userId);
        });

        it('does nothing when auth logs exist but account is not locked', async () => {
            const pastLock = new Date(now.getTime() - 60000);
            const log = new AuthLogs('id', userId, 2, now, null, false, pastLock, now);
            authLogsRepository.findByUserId.mockResolvedValueOnce(log);

            await expect(sut.validateBeforeLogin(userId)).resolves.not.toThrow();
        });

        it('throws ForbiddenException when account is locked', async () => {
            const lockedUntil = addMinutesToDate(now, 5);
            const log = new AuthLogs('id', userId, 3, now, null, false, lockedUntil, now);
            authLogsRepository.findByUserId.mockResolvedValue(log);

            await expect(sut.validateBeforeLogin(userId)).rejects.toThrow(ForbiddenException);
            await expect(sut.validateBeforeLogin(userId)).rejects.toThrow(/Account temporarily locked.*Try again in \d+ minute/);
        });
    });

    describe('registerFailedAttempt', () => {
        it('upserts with incremented attempts when under max', async () => {
            await sut.registerFailedAttempt(userId, '192.168.1.1', email);

            expect(authLogsRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(authLogsRepository.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    loginAttempts: 1,
                    lastLoginAttemptIp: '192.168.1.1',
                    lastLoginAttemptSuccess: false,
                    lockedUntil: undefined,
                }),
            );
            expect(accountLockedNotifyPublisher.publish).not.toHaveBeenCalled();
        });

        it('upserts and publishes when attempts reach max (lockout)', async () => {
            const existing = new AuthLogs('id', userId, 2, now, null, false, null, now);
            authLogsRepository.findByUserId.mockResolvedValueOnce(existing);

            await sut.registerFailedAttempt(userId, null, email);

            expect(authLogsRepository.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    loginAttempts: 0,
                    lastLoginAttemptSuccess: false,
                    lockedUntil: expect.any(Date),
                }),
            );
            expect(accountLockedNotifyPublisher.publish).toHaveBeenCalledTimes(1);
            expect(accountLockedNotifyPublisher.publish).toHaveBeenCalledWith({
                email,
                lockedUntilMinutes: 5,
            });
        });
    });

    describe('registerSuccessfulLogin', () => {
        it('upserts with zero attempts and success true', async () => {
            await sut.registerSuccessfulLogin(userId, '10.0.0.1');

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
