export interface IResetPasswordRequestEvent {
    email: string;
    token: string;
    expiresAt: Date;
}
