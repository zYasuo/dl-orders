import { z } from 'zod';

export const SOrderWasCreatedPayload = z.object({
    id: z.string().min(1, 'id is required'),
    productId: z.string().min(1, 'productId is required'),
    quantity: z.number().min(1, 'quantity must be greater than 0'),
    description: z.string(),
    recipient: z.email('recipient must be a valid email'),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type TOrderWasCreatedPayload = z.infer<typeof SOrderWasCreatedPayload>;
