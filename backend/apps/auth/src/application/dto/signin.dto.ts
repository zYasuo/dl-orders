import { z } from 'zod';

export const SSignin = z.object({
    email: z.email('email must be valid'),
    password: z.string().min(1, 'password is required'),
});

export type TSignin = z.infer<typeof SSignin>;
