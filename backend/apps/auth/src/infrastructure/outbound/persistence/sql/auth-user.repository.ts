import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../../../domain/ports/auth-user-repository.port';
import { TCreateAuthUser } from '../../../../domain/types/auth-user-repository.types';
import { DbService } from '../../../db/db.service';

@Injectable()
export class AuthUserRepository extends IAuthUserRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(data: TCreateAuthUser): Promise<UserEntity | null> {
        const row = await this.db.user.create({
            data: {
                emailEncrypted: data.emailEncrypted,
                emailLookupHash: data.emailLookupHash,
                passwordHash: data.passwordHash,
                name: data.name ?? null,
            },
        });

        return new UserEntity({
            id: row.id,
            emailEncrypted: row.emailEncrypted,
            emailLookupHash: row.emailLookupHash,
            passwordHash: row.passwordHash,
            name: row.name,
            emailVerified: row.emailVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async findByEmailLookupHash(emailLookupHash: string): Promise<UserEntity | null> {
        const row = await this.db.user.findUnique({ where: { emailLookupHash } });
        if (!row) return null;

        return new UserEntity({
            id: row.id,
            emailEncrypted: row.emailEncrypted,
            emailLookupHash: row.emailLookupHash,
            passwordHash: row.passwordHash,
            name: row.name,
            emailVerified: row.emailVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async markEmailVerified(id: string): Promise<UserEntity | null> {
        const row = await this.db.user.update({
            where: { id },
            data: { emailVerified: true },
        });

        return new UserEntity({
            id: row.id,
            emailEncrypted: row.emailEncrypted,
            emailLookupHash: row.emailLookupHash,
            passwordHash: row.passwordHash,
            name: row.name,
            emailVerified: row.emailVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async changePassword(id: string, password: string): Promise<boolean> {
        const row = await this.db.user.update({
            where: { id },
            data: { passwordHash: password },
        })
        
        if (!row) return false;
        
        return true;
    }
}
