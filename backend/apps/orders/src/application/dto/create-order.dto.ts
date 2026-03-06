import { z } from 'zod';

export const SCreateOrder = z.object({
    productId: z.string().min(1, 'productId is required'),
    quantity: z.number().min(1, 'quantity is required'),
    description: z.string().min(1, 'description is required'),
    recipient: z.email('recipient must be a valid email'),
});

export type TCreateOrder = z.infer<typeof SCreateOrder>;
