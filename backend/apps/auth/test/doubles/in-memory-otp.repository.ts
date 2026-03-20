import { OtpCodeEntity } from '../../src/domain/entities/otp-code.entity';
import { OtpRepositoryPort } from '../../src/domain/ports/repositories/otp-repository.port';

export class InMemoryOtpRepository extends OtpRepositoryPort {
  private readonly otps: OtpCodeEntity[] = [];

  async create(entity: OtpCodeEntity): Promise<OtpCodeEntity | null> {
    this.otps.push(entity);
    return entity;
  }

  async findLatestByUserId(userId: string): Promise<OtpCodeEntity | null> {
    const byUser = this.otps
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return byUser[0] ?? null;
  }

  async markUsedIfUnused(otpId: string): Promise<boolean> {
    const idx = this.otps.findIndex((o) => o.id === otpId);
    if (idx === -1) return false;

    const o = this.otps[idx];
    if (o.used || o.isExpired()) return false;

    this.otps[idx] = new OtpCodeEntity({
      id: o.id,
      code: o.code,
      userId: o.userId,
      expiresAt: o.expiresAt,
      used: true,
      createdAt: o.createdAt,
    });
    return true;
  }
}
