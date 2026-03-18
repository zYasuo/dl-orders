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
    const { emailEncrypted, emailLookupHash, linkResetPassword, expiresAt } = data;

    const passwordReset = await this.db.passwordReset.create({
      data: {
        emailEncrypted,
        emailLookupHash,
        linkResetPassword,
        expiresAt,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date(),
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
