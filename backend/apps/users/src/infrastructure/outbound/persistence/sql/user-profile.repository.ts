import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/users-client';
import { DbService } from '../../../db/db.service';
import { UserProfileEntity } from '../../../../domain/entities/user-profile.entity';
import { UserProfileRepositoryPort } from '../../../../domain/ports/user-profile-repository.port';

@Injectable()
export class UserProfileRepository extends UserProfileRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: UserProfileEntity): Promise<UserProfileEntity | null> {
    const row = await this.db.userProfile.create({
      data: {
        id: entity.id,
        email: entity.email,
        name: entity.name ?? null,
      },
    });
    return new UserProfileEntity({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async ensureExists(entity: UserProfileEntity): Promise<void> {
    const existing = await this.db.userProfile.findUnique({ where: { id: entity.id } });
    if (existing) {
      return;
    }
    try {
      await this.db.userProfile.create({
        data: {
          id: entity.id,
          email: entity.email,
          name: entity.name ?? null,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return;
      }
      throw e;
    }
  }

  async findById(id: string): Promise<UserProfileEntity | null> {
    const row = await this.db.userProfile.findUnique({ where: { id } });
    if (!row) return null;
    return new UserProfileEntity({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async update(entity: UserProfileEntity): Promise<UserProfileEntity | null> {
    const row = await this.db.userProfile.update({
      where: { id: entity.id },
      data: { name: entity.name ?? undefined },
    });
    return new UserProfileEntity({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
