import { z } from 'zod';

export const SVerifyOtp = z.object({
    email: z.email('email must be valid'),
    code: z.string().length(6, 'code must be 6 digits'),
});

export type TVerifyOtp = z.infer<typeof SVerifyOtp>;
