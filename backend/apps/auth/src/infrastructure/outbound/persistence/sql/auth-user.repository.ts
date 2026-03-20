import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { AuthUserRepositoryPort } from '../../../../domain/ports/repositories/auth-user-repository.port';
import { DbService } from '../../../db/db.service';

@Injectable()
export class AuthUserRepository extends AuthUserRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: UserEntity): Promise<UserEntity | null> {
    const row = await this.db.user.create({
      data: {
        id: entity.id,
        emailEncrypted: entity.emailEncrypted,
        emailLookupHash: entity.emailLookupHash,
        passwordHash: entity.passwordHash,
        name: entity.name ?? null,
        emailVerified: entity.emailVerified,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
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
    });

    if (!row) return false;

    return true;
  }
}
