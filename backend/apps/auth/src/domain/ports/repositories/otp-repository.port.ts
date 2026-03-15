import { OtpCodeEntity } from '../../entities/otp-code.entity';
import { TCreateOtp } from '../../types/otp-repository.types';

export abstract class IOtpRepositoryPort {
    abstract create(data: TCreateOtp): Promise<OtpCodeEntity | null>;
    abstract findLatestByUserId(userId: string): Promise<OtpCodeEntity | null>;
    abstract markUsedIfUnused(otpId: string): Promise<boolean>;
}
