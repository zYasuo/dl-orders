import { Injectable } from '@nestjs/common';
import { PasswordResetEntity } from 'apps/auth/src/domain/entities/password-reset.entity';
import { TCreatePasswordReset } from 'apps/auth/src/domain/types/password-repository.type';
import { DbService } from '../../../db/db.service';
import { IPasswordResetRepositoryPort } from '../../../../domain/ports/repositories/password-reset-repository.port';

@Injectable()
export class PasswordResetRepository extends IPasswordResetRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(data: TCreatePasswordReset): Promise<PasswordResetEntity> {
        const { emailEncrypted, emailLookupHash, token, expiresAt } = data;
        const passwordReset = await this.db.passwordReset.create({
            data: { emailEncrypted, emailLookupHash, token, expiresAt, used: false, createdAt: new Date(), updatedAt: new Date() },
        });

        return PasswordResetEntity.create({
            id: passwordReset.id,
            emailEncrypted: passwordReset.emailEncrypted,
            emailLookupHash: passwordReset.emailLookupHash,
            token: passwordReset.token,
            used: passwordReset.used,
            expiresAt: passwordReset.expiresAt,
            createdAt: passwordReset.createdAt,
            updatedAt: passwordReset.updatedAt,
        });
    }

    async findByToken(token: string): Promise<PasswordResetEntity | null> {
        const passwordReset = await this.db.passwordReset.findUnique({ where: { token } });

        if (!passwordReset) return null;

        return PasswordResetEntity.create({
            id: passwordReset.id,
            emailEncrypted: passwordReset.emailEncrypted,
            emailLookupHash: passwordReset.emailLookupHash,
            token: passwordReset.token,
            used: passwordReset.used,
            expiresAt: passwordReset.expiresAt,
            createdAt: passwordReset.createdAt,
            updatedAt: passwordReset.updatedAt,
        });
    }

    async findByEmailLookupHash(emailLookupHash: string): Promise<PasswordResetEntity | null> {
        const passwordReset = await this.db.passwordReset.findUnique({ where: { emailLookupHash } });

        if (!passwordReset) return null;

        return PasswordResetEntity.create({
            id: passwordReset.id,
            emailEncrypted: passwordReset.emailEncrypted,
            emailLookupHash: passwordReset.emailLookupHash,
            token: passwordReset.token,
            used: passwordReset.used,
            expiresAt: passwordReset.expiresAt,
            createdAt: passwordReset.createdAt,
            updatedAt: passwordReset.updatedAt,
        });
    }
}
