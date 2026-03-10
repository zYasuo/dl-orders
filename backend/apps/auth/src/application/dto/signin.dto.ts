import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SSignin = z.object({
    email: z.email('email must be valid'),
    password: z.string().min(1, 'password is required'),
    ip: z.string().optional(),
});

export type TSignin = z.infer<typeof SSignin>;
export class SigninDto extends createZodDto(SSignin) {}
