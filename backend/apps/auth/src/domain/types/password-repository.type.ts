export type TCreatePasswordReset = {
  emailEncrypted: string;
  emailLookupHash: string;
  linkResetPassword: string;
  expiresAt: Date;
};
