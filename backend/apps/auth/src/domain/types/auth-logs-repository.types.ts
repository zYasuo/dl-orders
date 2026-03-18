export type TUpsertAuthLogs = {
  userId: string;
  loginAttempts: number;
  lastLoginAttempt: Date;
  lastLoginAttemptIp?: string | null;
  lastLoginAttemptSuccess: boolean;
  lockedUntil?: Date | null;
};
