export interface IAuthLogs {
    id: string;
    userId: string;
    loginAttempts: number;
    lastLoginAttempt: Date;
    lastLoginAttemptIp: string | null;
    lastLoginAttemptSuccess: boolean;
    lockedUntil: Date | null;
    createdAt: Date;
}

export class AuthLogs implements IAuthLogs {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly loginAttempts: number,
        public readonly lastLoginAttempt: Date,
        public readonly lastLoginAttemptIp: string | null,
        public readonly lastLoginAttemptSuccess: boolean,
        public readonly lockedUntil: Date | null,
        public readonly createdAt: Date,
    ) {}

    static create(data: IAuthLogs): AuthLogs {
        const { id, userId, loginAttempts, lastLoginAttempt, lastLoginAttemptIp, lastLoginAttemptSuccess, lockedUntil, createdAt } = data;
        return new AuthLogs(id, userId, loginAttempts, lastLoginAttempt, lastLoginAttemptIp, lastLoginAttemptSuccess, lockedUntil, createdAt);
    }

    isLocked(): boolean {
        return this.lockedUntil ? this.lockedUntil > new Date() : false;
    }

    shouldLockAfterFailure(maxAttempts: number): boolean {
        return this.loginAttempts + 1 >= maxAttempts;
    }
}
