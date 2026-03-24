import * as crypto from 'node:crypto';
import { DomainError } from '@app/shared/domain';

export type TOtpCodeParams = {
  readonly id: string;
  readonly code: string;
  readonly userId: string;
  readonly expiresAt: Date;
  used: boolean;
  readonly createdAt: Date;
};

export class OtpCodeEntity {
  constructor(private params: TOtpCodeParams) {}

  get id() {
    return this.params.id;
  }
  get code() {
    return this.params.code;
  }
  get userId() {
    return this.params.userId;
  }
  get expiresAt() {
    return this.params.expiresAt;
  }
  get used() {
    return this.params.used;
  }
  get createdAt() {
    return this.params.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.params.expiresAt;
  }

  isUsed(): boolean {
    return this.params.used;
  }

  assertValid(): void {
    if (this.isExpired()) {
      throw new DomainError('OTP code has expired');
    }

    if (this.isUsed()) {
      throw new DomainError('OTP code has already been used');
    }
  }

  static generateCode(): string {
    return crypto.randomInt(100_000, 1_000_000).toString();
  }
}
