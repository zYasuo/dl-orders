import { Injectable } from '@nestjs/common';
import { PasswordResetEntity } from 'apps/auth/src/domain/entities/password-reset.entity';
import { DbService } from '../../../db/db.service';
import { PasswordResetRepositoryPort } from '../../../../domain/ports/repositories/password-reset-repository.port';

@Injectable()
export class PasswordResetRepository extends PasswordResetRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: PasswordResetEntity): Promise<PasswordResetEntity> {
    const passwordReset = await this.db.passwordReset.create({
      data: {
        id: entity.id,
        emailEncrypted: entity.emailEncrypted,
        emailLookupHash: entity.emailLookupHash,
        linkResetPassword: entity.linkResetPassword,
        expiresAt: entity.expiresAt,
        used: entity.used,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });

    return PasswordResetEntity.create({
      id: passwordReset.id,
      emailEncrypted: passwordReset.emailEncrypted,
      emailLookupHash: passwordReset.emailLookupHash,
      linkResetPassword: passwordReset.linkResetPassword,
      used: passwordReset.used,
      expiresAt: passwordReset.expiresAt,
      createdAt: passwordReset.createdAt,
      updatedAt: passwordReset.updatedAt,
    });
  }

  async findByLinkResetPassword(linkResetPassword: string): Promise<PasswordResetEntity | null> {
    const passwordReset = await this.db.passwordReset.findUnique({ where: { linkResetPassword } });

    if (!passwordReset) return null;

    return PasswordResetEntity.create({
      id: passwordReset.id,
      emailEncrypted: passwordReset.emailEncrypted,
      emailLookupHash: passwordReset.emailLookupHash,
      linkResetPassword: passwordReset.linkResetPassword,
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
      linkResetPassword: passwordReset.linkResetPassword,
      used: passwordReset.used,
      expiresAt: passwordReset.expiresAt,
      createdAt: passwordReset.createdAt,
      updatedAt: passwordReset.updatedAt,
    });
  }

  async consumeToken(linkResetPassword: string, emailLookupHash: string): Promise<boolean> {
    const now = new Date();

    const { count } = await this.db.passwordReset.updateMany({
      where: {
        linkResetPassword,
        emailLookupHash,
        used: false,
        expiresAt: { gt: now },
      },
      data: { used: true, updatedAt: now },
    });
    return count === 1;
  }
}
