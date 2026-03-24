import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email, Quantity } from '@app/shared/domain';

export const SCreateInventory = z
  .object({
    productId: z
      .string()
      .min(1, 'productId is required')
      .max(36, 'productId must be less than 36 characters'),
    name: z
      .string()
      .min(1, 'name is required')
      .max(200, 'name must be less than 200 characters'),
    maxQuantity: z
      .number()
      .int('maxQuantity must be an integer')
      .min(Quantity.MIN_VALUE, 'maxQuantity must be greater than 0')
      .max(1000, 'maxQuantity must be less than or equal to 1000'),
    minQuantity: z
      .number()
      .int('minQuantity must be an integer')
      .min(Quantity.MIN_VALUE, 'minQuantity must be greater than 0')
      .max(999, 'minQuantity must be less than maxQuantity'),
    lowStockThreshold: z
      .number()
      .int('lowStockThreshold must be an integer')
      .min(Quantity.MIN_VALUE, 'lowStockThreshold must be greater than 0')
      .max(999, 'lowStockThreshold must be less than or equal to minQuantity'),
    quantity: z
      .number()
      .int('quantity must be an integer')
      .min(Quantity.MIN_VALUE, 'quantity must be greater than 0')
      .max(1000, 'quantity must be less than or equal to 1000'),
    createdBy: z.email().max(Email.MAX_LENGTH, `createdBy must be less than ${Email.MAX_LENGTH} characters`),
  })
  .refine((data) => data.minQuantity < data.maxQuantity, {
    message: 'minQuantity must be less than maxQuantity',
    path: ['minQuantity'],
  })
  .refine((data) => data.lowStockThreshold <= data.minQuantity, {
    message: 'lowStockThreshold must be less than or equal to minQuantity',
    path: ['lowStockThreshold'],
  })
  .refine((data) => data.quantity <= data.maxQuantity, {
    message: 'quantity must be less than or equal to maxQuantity',
    path: ['quantity'],
  });

export type TCreateInventory = z.infer<typeof SCreateInventory>;
export class CreateInventoryDto extends createZodDto(SCreateInventory) {}
