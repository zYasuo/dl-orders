import { z } from 'zod';

export const ChangePasswordDto = z.object({
    email: z.email('email must be valid'),
    current_password: z.string().min(12).max(64),
    new_password: z.string().min(12).max(64),
});

export type TChangePassword = z.infer<typeof ChangePasswordDto>;
