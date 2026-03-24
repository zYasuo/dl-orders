import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SVerifyOtp = z.object({
  email: z.email('email must be valid').max(254, 'email must be less than 254 characters'),
  code: z.string().length(6, 'code must be 6 digits'),
});

export type TVerifyOtp = z.infer<typeof SVerifyOtp>;
export class VerifyOtpDto extends createZodDto(SVerifyOtp) {}
