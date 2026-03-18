import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import { OtpCodeEntity } from '../../../../domain/entities/otp-code.entity';
import { IOtpRepositoryPort } from '../../../../domain/ports/repositories/otp-repository.port';
import { TCreateOtp } from '../../../../domain/types/otp-repository.types';

@Injectable()
export class OtpRepository extends IOtpRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(data: TCreateOtp): Promise<OtpCodeEntity | null> {
    const row = await this.db.otpCode.create({
      data: {
        code: data.code,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
    return new OtpCodeEntity({
      id: row.id,
      code: row.code,
      userId: row.userId,
      expiresAt: row.expiresAt,
      used: row.used,
      createdAt: row.createdAt,
    });
  }

  async findLatestByUserId(userId: string): Promise<OtpCodeEntity | null> {
    const row = await this.db.otpCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) return null;
    return new OtpCodeEntity({
      id: row.id,
      code: row.code,
      userId: row.userId,
      expiresAt: row.expiresAt,
      used: row.used,
      createdAt: row.createdAt,
    });
  }

  async markUsedIfUnused(otpId: string): Promise<boolean> {
    const result = await this.db.otpCode.updateMany({
      where: {
        id: otpId,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        used: true,
      },
    });

    return result.count === 1;
  }
}
