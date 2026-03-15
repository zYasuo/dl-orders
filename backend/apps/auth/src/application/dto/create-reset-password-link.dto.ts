import { z } from 'zod';

export const CreateResetPasswordLinkDto = z.object({
    email: z.email('email must be valid'),
});

export type TCreateResetPasswordLink = z.infer<typeof CreateResetPasswordLinkDto>;