import { randomUUID } from 'crypto';

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

  static isExpired(expiresAt: Date): boolean {
    return expiresAt < new Date();
  }

  static isUsed(used: boolean): boolean {
    return used;
  }

  static expiresAtFromNow(): Date {
    return new Date(Date.now() + PasswordResetEntity.EXPIRES_IN_MINUTES * 60 * 1000);
  }

  static generateToken(): string {
    return randomUUID();
  }
}
