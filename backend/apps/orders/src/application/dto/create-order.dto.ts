import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SCreateOrder = z.object({
  productId: z
    .string()
    .min(1, 'productId is required')
    .max(36, 'productId must be less than 36 characters'),
  quantity: z.number().min(1, 'quantity is required').max(10000, 'quantity must be less than 10000'),
  description: z
    .string()
    .min(1, 'description is required')
    .max(500, 'description must be less than 500 characters'),
  recipient: z.email('recipient must be a valid email'),
  idempotencyKey: z.uuid('idempotencyKey must be a valid UUID'),
});

export type TCreateOrder = z.infer<typeof SCreateOrder>;
export class CreateOrderDto extends createZodDto(SCreateOrder) {}
