import { OtpCode } from '../../src/domain/entities/otp-code.entity';
import { IOtpRepositoryPort } from '../../src/domain/ports/otp-repository.port';
import { TCreateOtp } from '../../src/domain/types/otp-repository.types';

export class InMemoryOtpRepository extends IOtpRepositoryPort {
    private readonly otps: OtpCode[] = [];

    async create(data: TCreateOtp): Promise<OtpCode | null> {
        const now = new Date();
        const otp = new OtpCode({
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

    async findLatestByUserId(userId: string): Promise<OtpCode | null> {
        const byUser = this.otps.filter((o) => o.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return byUser[0] ?? null;
    }

    async markUsed(id: string): Promise<void> {
        const idx = this.otps.findIndex((o) => o.id === id);
        if (idx === -1) return;
        const o = this.otps[idx];
        this.otps[idx] = new OtpCode({
            id: o.id,
            code: o.code,
            userId: o.userId,
            expiresAt: o.expiresAt,
            used: true,
            createdAt: o.createdAt,
        });
    }
}
