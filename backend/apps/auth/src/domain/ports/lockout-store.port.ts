export abstract class ILockoutStorePort {
    abstract isLocked(userId: string): Promise<boolean>;
    abstract getLockedUntil(userId: string): Promise<Date | null>;
    abstract getFailedAttempts(userId: string): Promise<number>;
    abstract incrementFailedAttempts(userId: string): Promise<{ attempts: number; shouldLock: boolean }>;
    abstract setLocked(userId: string, minutes: number): Promise<void>;
    abstract resetOnSuccess(userId: string): Promise<void>;
}
