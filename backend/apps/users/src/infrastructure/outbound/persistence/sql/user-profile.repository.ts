import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import { UserProfile } from '../../../../domain/entities/user-profile.entity';
import { IUserProfileRepositoryPort } from '../../../../domain/ports/user-profile-repository.port';
import {
    TCreateUserProfile,
    TUpdateUserProfile,
} from '../../../../domain/types/user-profile-repository.types';

@Injectable()
export class UserProfileRepository extends IUserProfileRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(data: TCreateUserProfile): Promise<UserProfile | null> {
        const row = await this.db.userProfile.create({
            data: {
                id: data.id,
                email: data.email,
                name: data.name ?? null,
            },
        });
        return new UserProfile({
            id: row.id,
            email: row.email,
            name: row.name,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async findById(id: string): Promise<UserProfile | null> {
        const row = await this.db.userProfile.findUnique({ where: { id } });
        if (!row) return null;
        return new UserProfile({
            id: row.id,
            email: row.email,
            name: row.name,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async update(id: string, data: TUpdateUserProfile): Promise<UserProfile | null> {
        const row = await this.db.userProfile.update({
            where: { id },
            data: { name: data.name ?? undefined },
        });
        return new UserProfile({
            id: row.id,
            email: row.email,
            name: row.name,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
