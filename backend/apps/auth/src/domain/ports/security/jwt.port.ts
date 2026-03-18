export type TJwtPayload = {
  sub: string;
  email: string;
  jti?: string;
};

export abstract class IJwtPort {
  abstract sign(payload: TJwtPayload): Promise<string>;
  abstract verify(token: string): Promise<TJwtPayload | null>;
  abstract getExpiresInSeconds(): number;
}
