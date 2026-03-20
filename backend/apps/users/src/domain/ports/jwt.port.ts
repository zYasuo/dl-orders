export type TJwtPayload = {
  sub: string;
  email: string;
};

export abstract class JwtPort {
  abstract verify(token: string): Promise<TJwtPayload | null>;
}
