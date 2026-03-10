import { AuthLogs } from '../entities/auth-logs.entity';
import { TUpsertAuthLogs } from '../types/auth-logs-repository.types';

export abstract class IAuthLogsRepositoryPort {
    abstract findByUserId(userId: string): Promise<AuthLogs | null>;
    abstract upsert(data: TUpsertAuthLogs): Promise<AuthLogs>;
}
