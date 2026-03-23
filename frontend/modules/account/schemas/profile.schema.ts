import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string().max(200, 'Máximo 200 caracteres'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
