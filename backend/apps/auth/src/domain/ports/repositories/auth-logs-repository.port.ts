import { AuthLogsEntity } from '../../entities/auth-logs.entity';
import { TUpsertAuthLogs } from '../../types/auth-logs-repository.types';

export abstract class AuthLogsRepositoryPort {
  abstract findByUserId(userId: string): Promise<AuthLogsEntity | null>;
  abstract upsert(data: TUpsertAuthLogs): Promise<AuthLogsEntity>;
}
