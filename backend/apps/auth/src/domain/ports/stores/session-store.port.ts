export type TSessionData = {
    sub: string;
    email: string;
};

export abstract class ISessionStorePort {
    abstract set(sessionId: string, data: TSessionData, ttlSeconds: number): Promise<void>;
}
