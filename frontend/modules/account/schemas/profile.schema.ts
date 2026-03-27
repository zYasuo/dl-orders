import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string().max(200, 'At most 200 characters'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
