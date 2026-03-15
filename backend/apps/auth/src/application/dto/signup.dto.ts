import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SSignup = z.object({
    email: z.email('email must be valid'),
    password: z.string().min(12, 'password must be at least 12 characters').max(64, 'password must be less than 64 characters'),
    name: z.string().min(1, 'name is required').optional(),
});

export type TSignup = z.infer<typeof SSignup>;
export class SignupDto extends createZodDto(SSignup) {}
