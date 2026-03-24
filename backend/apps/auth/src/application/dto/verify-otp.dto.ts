import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email } from '@app/shared/domain';

export const SVerifyOtp = z.object({
  email: z.email('email must be valid').max(Email.MAX_LENGTH, `email must be less than ${Email.MAX_LENGTH} characters`),
  code: z.string().length(6, 'code must be 6 digits'),
});

export type TVerifyOtp = z.infer<typeof SVerifyOtp>;
export class VerifyOtpDto extends createZodDto(SVerifyOtp) {}
