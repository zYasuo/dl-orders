import { registerAs } from '@nestjs/config';

export interface EmailEncryptionConfig {
    key: string;
    hashSecret: string;
    algorithm: string;
    ivLength: number;
    authTagLength: number;
    keyLength: number;
}

export const emailEncryptionConfig = registerAs('emailEncryption', (): EmailEncryptionConfig => {
    const key = process.env.EMAIL_ENCRYPTED_KEY;
    const hashSecret = process.env.EMAIL_HASH_SECRET;

    if (!key?.length) {
        throw new Error('EMAIL_ENCRYPTED_KEY is required for email encryption');
    }

    if (!hashSecret?.length) {
        throw new Error('EMAIL_HASH_SECRET is required for email lookup hash');
    }
    return {
        key,
        hashSecret,
        algorithm: 'aes-256-gcm',
        ivLength: 12,
        authTagLength: 16,
        keyLength: 32,
    };
});
