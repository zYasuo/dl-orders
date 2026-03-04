import { z } from 'zod';

export const SCreateStockWithProductRelation = z.object({
    productId: z.string().min(1, 'productId is required'),
    name: z.string().min(1, 'name is required'),
    quantity: z.number().min(1, 'quantity must be greater than 0').max(100, 'quantity must be less than 100'),
});

export type TCreateStockWithProductRelation = z.infer<typeof SCreateStockWithProductRelation>;
