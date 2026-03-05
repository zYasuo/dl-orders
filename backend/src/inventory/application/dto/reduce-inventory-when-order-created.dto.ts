import { z } from 'zod';

export const SReduceInventory = z.object({
    productId: z.string().min(1, 'productId is required'),
    quantity: z.number().min(1, 'quantity must be greater than 0'),
});

export type TReduceInventory = z.infer<typeof SReduceInventory>;
