import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SSignin = z.object({
    email: z.email('email must be valid'),
    password: z.string().min(12, 'password must be at least 12 characters').max(64, 'password must be less than 64 characters'),
    ip: z.string().optional(),
});

export type TSignin = z.infer<typeof SSignin>;
export class SigninDto extends createZodDto(SSignin) {}
