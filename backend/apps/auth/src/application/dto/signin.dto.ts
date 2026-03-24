import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SSignin = z.object({
  email: z.email('email must be valid').max(254, 'email must be less than 254 characters'),
  password: z
    .string()
    .min(12, 'password must be at least 12 characters')
    .max(64, 'password must be less than 64 characters'),
  ip: z.string().max(45, 'ip must be less than 45 characters').optional(),
});

export type TSignin = z.infer<typeof SSignin>;
export class SigninDto extends createZodDto(SSignin) {}
