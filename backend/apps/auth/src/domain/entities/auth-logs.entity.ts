const MS_PER_MINUTE = 60 * 1000;

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
  static readonly MAX_LOGIN_ATTEMPTS = 3;
  static readonly LOCKOUT_MINUTES = 5;

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
    const {
      id,
      userId,
      loginAttempts,
      lastLoginAttempt,
      lastLoginAttemptIp,
      lastLoginAttemptSuccess,
      lockedUntil,
      createdAt,
    } = data;
    return new AuthLogsEntity(
      id,
      userId,
      loginAttempts,
      lastLoginAttempt,
      lastLoginAttemptIp,
      lastLoginAttemptSuccess,
      lockedUntil,
      createdAt,
    );
  }

  static addMinutesToDate(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * MS_PER_MINUTE);
  }

  static lockoutEndFromNow(minutes: number): Date {
    return AuthLogsEntity.addMinutesToDate(new Date(), minutes);
  }

  static minutesRemainingUntil(until: Date, from: Date = new Date()): number {
    const ms = until.getTime() - from.getTime();
    if (ms <= 0) return 0;
    return Math.ceil(ms / MS_PER_MINUTE);
  }
}
