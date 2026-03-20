export type TSessionData = {
  sub: string;
  email: string;
};

export abstract class SessionStorePort {
  abstract set(sessionId: string, data: TSessionData, ttlSeconds: number): Promise<void>;
}
