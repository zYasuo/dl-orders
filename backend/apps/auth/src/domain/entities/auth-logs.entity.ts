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

export class AuthLogsEntity implements IAuthLogs {
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

    static create(data: IAuthLogs): AuthLogsEntity {
        const { id, userId, loginAttempts, lastLoginAttempt, lastLoginAttemptIp, lastLoginAttemptSuccess, lockedUntil, createdAt } = data;
        return new AuthLogsEntity(id, userId, loginAttempts, lastLoginAttempt, lastLoginAttemptIp, lastLoginAttemptSuccess, lockedUntil, createdAt);
    }
}
