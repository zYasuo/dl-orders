import { z } from 'zod';

export const SCreateProduct = z.object({
    name: z.string().min(1, 'name is required'),
    description: z.string().min(1, 'description is required'),
    price: z.number().min(0, 'price is required').max(1000000, 'price must be less than 1000000'),
});

export type TCreateProduct = z.infer<typeof SCreateProduct>;
