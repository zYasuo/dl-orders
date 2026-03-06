import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import { User } from '../../../../domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../../../domain/ports/auth-user-repository.port';
import { TCreateAuthUser } from '../../../../domain/types/auth-user-repository.types';

@Injectable()
export class AuthUserRepository extends IAuthUserRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(data: TCreateAuthUser): Promise<User | null> {
        const row = await this.db.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                name: data.name ?? null,
            },
        });
        return new User({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            name: row.name,
            emailVerified: row.emailVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        const row = await this.db.user.findUnique({ where: { email } });
        if (!row) return null;
        return new User({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            name: row.name,
            emailVerified: row.emailVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async markEmailVerified(id: string): Promise<User | null> {
        const row = await this.db.user.update({
            where: { id },
            data: { emailVerified: true },
        });
        return new User({
            id: row.id,
            email: row.email,
            passwordHash: row.passwordHash,
            name: row.name,
            emailVerified: row.emailVerified,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
