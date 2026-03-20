import { SessionStorePort, TSessionData } from '../../src/domain/ports/stores/session-store.port';

export class InMemorySessionStore extends SessionStorePort {
  private readonly store = new Map<string, { data: TSessionData; ttl: number }>();

  async set(sessionId: string, data: TSessionData, ttlSeconds: number): Promise<void> {
    this.store.set(sessionId, { data, ttl: ttlSeconds });
  }

  get(sessionId: string): TSessionData | undefined {
    return this.store.get(sessionId)?.data;
  }
}
