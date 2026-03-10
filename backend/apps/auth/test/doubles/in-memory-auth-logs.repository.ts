import { AuthLogs } from '../../src/domain/entities/auth-logs.entity';
import { IAuthLogsRepositoryPort } from '../../src/domain/ports/auth-logs-repository.port';
import { TUpsertAuthLogs } from '../../src/domain/types/auth-logs-repository.types';

export class InMemoryAuthLogsRepository extends IAuthLogsRepositoryPort {
    private readonly logs = new Map<string, AuthLogs>();

    async findByUserId(userId: string): Promise<AuthLogs | null> {
        return this.logs.get(userId) ?? null;
    }

    async upsert(data: TUpsertAuthLogs): Promise<AuthLogs> {
        const existing = this.logs.get(data.userId);
        const id = existing?.id ?? crypto.randomUUID();
        const now = data.lastLoginAttempt;
        const log = new AuthLogs(
            id,
            data.userId,
            data.loginAttempts,
            now,
            data.lastLoginAttemptIp ?? null,
            data.lastLoginAttemptSuccess,
            data.lockedUntil ?? null,
            existing?.createdAt ?? now,
        );
        this.logs.set(data.userId, log);
        return log;
    }
}
