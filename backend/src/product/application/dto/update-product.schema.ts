import { z } from 'zod';

export const SUpdateProduct = z.object({
    name: z.string().min(1, 'name is required'),
    description: z.string().min(1, 'description is required'),
    price: z.number().min(0, 'price is required'),
});

export type TUpdateProduct = z.infer<typeof SUpdateProduct>;
