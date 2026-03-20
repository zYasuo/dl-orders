import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountLockedNotifyPublisherPort } from '../../domain/ports/publishers/account-locked-notify-publisher.port';
import { AuthLogsRepositoryPort } from '../../domain/ports/repositories/auth-logs-repository.port';
import { LockoutStorePort } from '../../domain/ports/stores/lockout-store.port';
import { AuthLogsEntity } from '../../domain/entities/auth-logs.entity';

@Injectable()
export class ValidateAuthAttemptUseCase {
  constructor(
    private readonly lockoutStore: LockoutStorePort,
    private readonly authLogsRepository: AuthLogsRepositoryPort,
    private readonly accountLockedNotifyPublisher: AccountLockedNotifyPublisherPort,
  ) {}

  async validateBeforeLogin(userId: string): Promise<void> {
    const lockedUntil = await this.lockoutStore.getLockedUntil(userId);

    if (!lockedUntil) return;

    const minutesLeft = AuthLogsEntity.minutesRemainingUntil(lockedUntil);

    throw new ForbiddenException(
      `Account temporarily locked. Try again in ${minutesLeft} minute(s).`,
    );
  }

  async registerFailedAttempt(userId: string, ip: string | null, email: string): Promise<void> {
    const now = new Date();
    const { attempts, shouldLock } = await this.lockoutStore.incrementFailedAttempts(userId);

    if (shouldLock) {
      await this.lockoutStore.setLocked(userId, AuthLogsEntity.LOCKOUT_MINUTES);
      await this.accountLockedNotifyPublisher.publish({
        email,
        lockedUntilMinutes: AuthLogsEntity.LOCKOUT_MINUTES,
      });
    }

    await this.authLogsRepository.upsert({
      userId,
      loginAttempts: shouldLock ? 0 : attempts,
      lastLoginAttempt: now,
      lastLoginAttemptIp: ip ?? null,
      lastLoginAttemptSuccess: false,
      lockedUntil: shouldLock
        ? AuthLogsEntity.lockoutEndFromNow(AuthLogsEntity.LOCKOUT_MINUTES)
        : undefined,
    });
  }

  async registerSuccessfulLogin(userId: string, ip: string | null): Promise<void> {
    const now = new Date();
    await this.lockoutStore.resetOnSuccess(userId);
    await this.authLogsRepository.upsert({
      userId,
      loginAttempts: 0,
      lastLoginAttempt: now,
      lastLoginAttemptIp: ip ?? null,
      lastLoginAttemptSuccess: true,
    });
  }
}
