import { IJwtPort, TJwtPayload } from '../../src/domain/ports/jwt.port';

export class FakeJwtPort extends IJwtPort {
    private readonly tokenPrefix = 'fake-jwt-';

    getExpiresInSeconds(): number {
        return 86400;
    }

    async sign(payload: TJwtPayload): Promise<string> {
        return `${this.tokenPrefix}${payload.sub}`;
    }

    async verify(token: string): Promise<TJwtPayload | null> {
        if (!token.startsWith(this.tokenPrefix)) return null;
        const sub = token.slice(this.tokenPrefix.length);
        return { sub, email: `${sub}@test.com` };
    }
}
