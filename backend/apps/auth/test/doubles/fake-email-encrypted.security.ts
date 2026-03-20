import { EmailEncryptedSecurity } from '../../src/domain/ports/security/email-encrypted.port';

export class FakeEmailEncryptedSecurity extends EmailEncryptedSecurity {
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

