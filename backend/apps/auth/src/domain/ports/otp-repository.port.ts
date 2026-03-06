import { OtpCode } from '../entities/otp-code.entity';
import { TCreateOtp } from '../types/otp-repository.types';

export abstract class IOtpRepositoryPort {
    abstract create(data: TCreateOtp): Promise<OtpCode | null>;
    abstract findLatestByUserId(userId: string): Promise<OtpCode | null>;
    abstract markUsed(id: string): Promise<void>;
}
