import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import { OtpCode } from '../../../../domain/entities/otp-code.entity';
import { IOtpRepositoryPort } from '../../../../domain/ports/otp-repository.port';
import { TCreateOtp } from '../../../../domain/types/otp-repository.types';

@Injectable()
export class OtpRepository extends IOtpRepositoryPort {
    constructor(private readonly db: DbService) {
        super();
    }

    async create(data: TCreateOtp): Promise<OtpCode | null> {
        const row = await this.db.otpCode.create({
            data: {
                code: data.code,
                userId: data.userId,
                expiresAt: data.expiresAt,
            },
        });
        return new OtpCode({
            id: row.id,
            code: row.code,
            userId: row.userId,
            expiresAt: row.expiresAt,
            used: row.used,
            createdAt: row.createdAt,
        });
    }

    async findLatestByUserId(userId: string): Promise<OtpCode | null> {
        const row = await this.db.otpCode.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        if (!row) return null;
        return new OtpCode({
            id: row.id,
            code: row.code,
            userId: row.userId,
            expiresAt: row.expiresAt,
            used: row.used,
            createdAt: row.createdAt,
        });
    }

    async markUsed(id: string): Promise<void> {
        await this.db.otpCode.update({
            where: { id },
            data: { used: true },
        });
    }
}
