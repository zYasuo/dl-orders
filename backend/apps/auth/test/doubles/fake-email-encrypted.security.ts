import { IEmailEncryptedSecurity } from '../../src/domain/ports/email-encrypted.security';

export class FakeEmailEncryptedSecurity extends IEmailEncryptedSecurity {
    private normalize(email: string): string {
        return email.toLowerCase().trim();
    }

    async encrypt(email: string): Promise<string> {
        return this.normalize(email);
    }

    async decrypt(encryptedEmail: string): Promise<string> {
        return encryptedEmail;
    }

    async getLookupHash(email: string): Promise<string> {
        return this.normalize(email);
    }
}
