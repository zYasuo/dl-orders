import { z } from 'zod';

export const SReduceStock = z.object({
    id: z.string('id is required'),
    quantity: z.number().min(1, 'quantity must be greater than 0'),
});

export type TReduceStock = z.infer<typeof SReduceStock>;
