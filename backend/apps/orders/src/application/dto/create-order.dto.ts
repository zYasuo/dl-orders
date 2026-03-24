import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email, Quantity } from '@app/shared/domain';

export const SCreateOrder = z.object({
  productId: z
    .string()
    .min(1, 'productId is required')
    .max(36, 'productId must be less than 36 characters'),
  quantity: z
    .number()
    .int('quantity must be an integer')
    .min(Quantity.MIN_VALUE, 'quantity must be at least 1')
    .max(10000, 'quantity must be less than 10000'),
  description: z
    .string()
    .min(1, 'description is required')
    .max(500, 'description must be less than 500 characters'),
  recipient: z.email('recipient must be a valid email').max(Email.MAX_LENGTH, `recipient must be less than ${Email.MAX_LENGTH} characters`),
  idempotencyKey: z.uuid('idempotencyKey must be a valid UUID'),
});

export type TCreateOrder = z.infer<typeof SCreateOrder>;
export class CreateOrderDto extends createZodDto(SCreateOrder) {}
