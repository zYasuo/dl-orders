import { z } from 'zod';

export const SCreateResetPasswordLinkDto = z.object({
    email: z.email('email must be valid'),
});

export type TCreateResetPasswordLink = z.infer<typeof SCreateResetPasswordLinkDto>;