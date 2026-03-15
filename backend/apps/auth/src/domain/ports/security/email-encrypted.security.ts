export abstract class IEmailEncryptedSecurity {
    abstract encrypt(email: string): Promise<string>;
    abstract decrypt(encryptedEmail: string): Promise<string>;
    abstract getLookupHash(email: string): Promise<string>;
}
