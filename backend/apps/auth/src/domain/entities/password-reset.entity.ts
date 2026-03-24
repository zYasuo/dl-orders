import { randomUUID } from 'crypto';
import { DomainError } from '@app/shared/domain';

export interface IPasswordResetEntity {
  id: string;
  emailEncrypted: string;
  emailLookupHash: string;
  linkResetPassword: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PasswordResetEntity implements IPasswordResetEntity {
  static readonly EXPIRES_IN_MINUTES = 10;

  constructor(
    public readonly id: string,
    public readonly emailEncrypted: string,
    public readonly emailLookupHash: string,
    public readonly linkResetPassword: string,
    public readonly used: boolean,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: IPasswordResetEntity): PasswordResetEntity {
    const { id, emailEncrypted, emailLookupHash, linkResetPassword, used, expiresAt } = data;

    const now = new Date();

    return new PasswordResetEntity(
      id,
      emailEncrypted,
      emailLookupHash,
      linkResetPassword,
      used,
      expiresAt,
      now,
      now,
    );
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isUsed(): boolean {
    return this.used;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }

  assertValid(): void {
    if (this.isExpired()) {
      throw new DomainError('Password reset link has expired');
    }

    if (this.isUsed()) {
      throw new DomainError('Password reset link has already been used');
    }
  }

  static expiresAtFromNow(): Date {
    return new Date(Date.now() + PasswordResetEntity.EXPIRES_IN_MINUTES * 60 * 1000);
  }

  static generateToken(): string {
    return randomUUID();
  }
}
