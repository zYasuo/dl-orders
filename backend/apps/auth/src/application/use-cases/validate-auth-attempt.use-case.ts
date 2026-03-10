import { ForbiddenException, Injectable } from '@nestjs/common';
import { IAccountLockedNotifyPublisherPort } from '../../domain/ports/account-locked-notify-publisher.port';
import { IAuthLogsRepositoryPort } from '../../domain/ports/auth-logs-repository.port';
import { LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS, lockoutEndFromNow, minutesRemainingUntil } from '../../utils/lockout.utils';

@Injectable()
export class ValidateAuthAttemptUseCase {
    constructor(
        private readonly authLogsRepository: IAuthLogsRepositoryPort,
        private readonly accountLockedNotifyPublisher: IAccountLockedNotifyPublisherPort,
    ) {}

    async validateBeforeLogin(userId: string): Promise<void> {
        const authLogs = await this.authLogsRepository.findByUserId(userId);

        if (authLogs?.isLocked() && authLogs.lockedUntil) {
            const minutesLeft = minutesRemainingUntil(authLogs.lockedUntil);

            throw new ForbiddenException(`Account temporarily locked. Try again in ${minutesLeft} minute(s).`);
        }
    }

    async registerFailedAttempt(userId: string, ip: string | null, email: string): Promise<void> {
        const existing = await this.authLogsRepository.findByUserId(userId);
        const now = new Date();

        const nextAttempts = (existing?.loginAttempts ?? 0) + 1;
        const shouldLock = nextAttempts >= MAX_LOGIN_ATTEMPTS;

        const lockedUntil = shouldLock ? lockoutEndFromNow(LOCKOUT_MINUTES) : null;

        await this.authLogsRepository.upsert({
            userId,
            loginAttempts: shouldLock ? 0 : nextAttempts,
            lastLoginAttempt: now,
            lastLoginAttemptIp: ip ?? null,
            lastLoginAttemptSuccess: false,
            lockedUntil: lockedUntil ?? undefined,
        });

        if (shouldLock) {
            await this.accountLockedNotifyPublisher.publish({
                email,
                lockedUntilMinutes: LOCKOUT_MINUTES,
            });
        }
    }

    async registerSuccessfulLogin(userId: string, ip: string | null): Promise<void> {
        const now = new Date();
        await this.authLogsRepository.upsert({
            userId,
            loginAttempts: 0,
            lastLoginAttempt: now,
            lastLoginAttemptIp: ip ?? null,
            lastLoginAttemptSuccess: true,
        });
    }
}
