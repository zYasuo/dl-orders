export type TCreatePasswordReset = {
    emailEncrypted: string;
    emailLookupHash: string;
    token: string;
    expiresAt: Date;
}