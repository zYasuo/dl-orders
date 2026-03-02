import { z } from 'zod';

export const SCreateOrder = z.object({
    description: z.string().min(1, 'description is required'),
});

export type TCreateOrder = z.infer<typeof SCreateOrder>;
