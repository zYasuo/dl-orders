import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email } from '@app/shared/domain';

export const SSignup = z.object({
  email: z.email('email must be valid').max(Email.MAX_LENGTH, `email must be less than ${Email.MAX_LENGTH} characters`),
  password: z
    .string()
    .min(12, 'password must be at least 12 characters')
    .max(64, 'password must be less than 64 characters'),
  name: z
    .string()
    .min(1, 'name is required')
    .max(200, 'name must be less than 200 characters'),
});

export type TSignup = z.infer<typeof SSignup>;
export class SignupDto extends createZodDto(SSignup) {}
