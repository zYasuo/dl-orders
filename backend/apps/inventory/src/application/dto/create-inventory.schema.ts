import { z } from 'zod';

export const SCreateInventory = z.object({
    productId: z.string().min(1, 'productId is required'),
    name: z.string().min(1, 'name is required'),
    quantity: z.number().min(1, 'quantity must be greater than 0').max(100, 'quantity must be less than 100'),
});

export type TCreateInventory = z.infer<typeof SCreateInventory>;
