export interface IResetPasswordRequestEvent {
  email: string;
  linkResetPassword: string;
  expiresAt: Date;
}
