import { OtpCodeEntity } from '../../entities/otp-code.entity';

export abstract class OtpRepositoryPort {
  abstract create(entity: OtpCodeEntity): Promise<OtpCodeEntity | null>;
  abstract findLatestByUserId(userId: string): Promise<OtpCodeEntity | null>;
  abstract markUsedIfUnused(otpId: string): Promise<boolean>;
}
