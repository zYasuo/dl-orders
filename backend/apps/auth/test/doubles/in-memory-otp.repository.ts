import { OtpCodeEntity } from '../../src/domain/entities/otp-code.entity';
import { IOtpRepositoryPort } from '../../src/domain/ports/repositories/otp-repository.port';
import { TCreateOtp } from '../../src/domain/types/otp-repository.types';

export class InMemoryOtpRepository extends IOtpRepositoryPort {
  private readonly otps: OtpCodeEntity[] = [];

  async create(data: TCreateOtp): Promise<OtpCodeEntity | null> {
    const now = new Date();

    const otp = new OtpCodeEntity({
      id: crypto.randomUUID(),
      code: data.code,
      userId: data.userId,
      expiresAt: data.expiresAt,
      used: false,
      createdAt: now,
    });

    this.otps.push(otp);
    return otp;
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
