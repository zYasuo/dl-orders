export type TJwtPayload = {
    sub: string;
    email: string;
};

export abstract class IJwtPort {
    abstract verify(token: string): Promise<TJwtPayload | null>;
}
