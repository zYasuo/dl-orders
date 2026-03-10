import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { EmailEncryptionConfig } from '../../../config/email-encryption.config';
import { IEmailEncryptedSecurity } from '../../../domain/ports/email-encrypted.security';

@Injectable()
export class EmailEncryptedSecurity implements IEmailEncryptedSecurity {
    private readonly config: EmailEncryptionConfig;
    private readonly key: Buffer;

    constructor(configService: ConfigService) {
        this.config = configService.getOrThrow<EmailEncryptionConfig>('emailEncryption');
        this.key = this.deriveKey(this.config.key);
    }

    private deriveKey(raw: string): Buffer {
        if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
            return Buffer.from(raw, 'hex');
        }
        return crypto.createHash('sha256').update(raw, 'utf8').digest();
    }

    private normalize(email: string): string {
        return email.toLowerCase().trim();
    }

    async getLookupHash(email: string): Promise<string> {
        const normalized = this.normalize(email);
        return crypto.createHmac('sha256', this.config.hashSecret).update(normalized, 'utf8').digest('hex');
    }

    async encrypt(email: string): Promise<string> {
        const normalized = this.normalize(email);
        const iv = crypto.randomBytes(this.config.ivLength);
        const cipher = crypto.createCipheriv(this.config.algorithm, this.key, iv);

        let ciphertextHex = cipher.update(normalized, 'utf8', 'hex');
        ciphertextHex += cipher.final('hex');

        const authTag = (cipher as crypto.CipherGCM).getAuthTag();
        return this.serializePayload(iv, authTag, ciphertextHex);
    }

    async decrypt(encryptedEmail: string): Promise<string> {
        const { iv, authTag, ciphertextHex } = this.parsePayload(encryptedEmail);
        const decipher = crypto.createDecipheriv(this.config.algorithm, this.key, iv);

        (decipher as crypto.DecipherGCM).setAuthTag(authTag);

        let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    private serializePayload(iv: Buffer, authTag: Buffer, ciphertextHex: string): string {
        return iv.toString('hex') + authTag.toString('hex') + ciphertextHex;
    }

    private parsePayload(encryptedEmail: string): { iv: Buffer; authTag: Buffer; ciphertextHex: string } {
        const ivHexLen = this.config.ivLength * 2;
        const tagHexLen = this.config.authTagLength * 2;

        const ivHex = encryptedEmail.slice(0, ivHexLen);
        const authTagHex = encryptedEmail.slice(ivHexLen, ivHexLen + tagHexLen);
        const ciphertextHex = encryptedEmail.slice(ivHexLen + tagHexLen);

        return {
            iv: Buffer.from(ivHex, 'hex'),
            authTag: Buffer.from(authTagHex, 'hex'),
            ciphertextHex,
        };
    }
}
