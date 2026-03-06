import { z } from 'zod';

export const SSignup = z.object({
    email: z.email('email must be valid'),
    password: z.string().min(8, 'password must be at least 8 characters'),
    name: z.string().min(1, 'name is required').optional(),
});

export type TSignup = z.infer<typeof SSignup>;
