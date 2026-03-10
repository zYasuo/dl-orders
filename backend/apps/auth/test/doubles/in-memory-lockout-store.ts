import { ILockoutStorePort } from '../../src/domain/ports/lockout-store.port';
import { MAX_LOGIN_ATTEMPTS } from '../../src/utils/lockout.utils';

export class InMemoryLockoutStore extends ILockoutStorePort {
    private readonly attempts = new Map<string, number>();
    private readonly lockedUntil = new Map<string, Date>();

    async isLocked(userId: string): Promise<boolean> {
        const until = await this.getLockedUntil(userId);
        return until !== null && until > new Date();
    }

    async getLockedUntil(userId: string): Promise<Date | null> {
        return this.lockedUntil.get(userId) ?? null;
    }

    async getFailedAttempts(userId: string): Promise<number> {
        return this.attempts.get(userId) ?? 0;
    }

    async incrementFailedAttempts(userId: string): Promise<{ attempts: number; shouldLock: boolean }> {
        const current = this.attempts.get(userId) ?? 0;
        const next = current + 1;
        this.attempts.set(userId, next);
        return {
            attempts: next,
            shouldLock: next >= MAX_LOGIN_ATTEMPTS,
        };
    }

    async setLocked(userId: string, minutes: number): Promise<void> {
        const until = new Date(Date.now() + minutes * 60 * 1000);
        this.lockedUntil.set(userId, until);
        this.attempts.set(userId, 0);
    }

    async resetOnSuccess(userId: string): Promise<void> {
        this.attempts.delete(userId);
        this.lockedUntil.delete(userId);
    }
}
