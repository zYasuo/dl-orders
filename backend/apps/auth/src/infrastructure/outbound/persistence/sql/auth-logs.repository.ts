import { Injectable } from '@nestjs/common';
import { AuthLogsEntity } from '../../../../domain/entities/auth-logs.entity';
import { AuthLogsRepositoryPort } from '../../../../domain/ports/repositories/auth-logs-repository.port';
import { TUpsertAuthLogs } from '../../../../domain/types/auth-logs-repository.types';
import { DbService } from '../../../db/db.service';

@Injectable()
export class AuthLogsRepository extends AuthLogsRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async findByUserId(userId: string): Promise<AuthLogsEntity | null> {
    const row = await this.db.authLogs.findUnique({
      where: { userId },
    });

    if (!row) return null;

    return new AuthLogsEntity(
      row.id,
      row.userId,
      row.loginAttempts,
      row.lastLoginAttempt,
      row.lastLoginAttemptIp,
      row.lastLoginAttemptSuccess,
      row.lockedUntil,
      row.createdAt,
    );
  }

  async upsert(data: TUpsertAuthLogs): Promise<AuthLogsEntity> {
    const row = await this.db.authLogs.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        loginAttempts: data.loginAttempts,
        lastLoginAttempt: data.lastLoginAttempt,
        lastLoginAttemptIp: data.lastLoginAttemptIp ?? null,
        lastLoginAttemptSuccess: data.lastLoginAttemptSuccess,
        lockedUntil: data.lockedUntil ?? null,
      },
      update: {
        loginAttempts: data.loginAttempts,
        lastLoginAttempt: data.lastLoginAttempt,
        lastLoginAttemptIp: data.lastLoginAttemptIp ?? null,
        lastLoginAttemptSuccess: data.lastLoginAttemptSuccess,
        lockedUntil: data.lockedUntil ?? null,
      },
    });

    return new AuthLogsEntity(
      row.id,
      row.userId,
      row.loginAttempts,
      row.lastLoginAttempt,
      row.lastLoginAttemptIp,
      row.lastLoginAttemptSuccess,
      row.lockedUntil,
      row.createdAt,
    );
  }
}
