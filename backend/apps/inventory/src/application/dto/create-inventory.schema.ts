import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SCreateInventory = z.object({
  productId: z
    .string()
    .min(1, 'productId is required')
    .max(36, 'productId must be less than 36 characters'),
  name: z.string().min(1, 'name is required').max(200, 'name must be less than 200 characters'),
  maxQuantity: z
    .number()
    .min(1, 'maxQuantity must be greater than 0')
    .max(1000, 'maxQuantity must be less than 1000'),
  minQuantity: z
    .number()
    .min(1, 'minQuantity must be greater than 0')
    .max(1000, 'minQuantity must be less than 5'),
  lowStockThreshold: z
    .number()
    .min(1, 'lowStockThreshold must be greater than 0')
    .max(5, 'lowStockThreshold must be less than 100'),
  quantity: z
    .number()
    .min(1, 'quantity must be greater than 0')
    .max(1000, 'quantity must be less than 1000'),
  createdBy: z.email().max(254, 'createdBy must be less than 254 characters'),
});

export type TCreateInventory = z.infer<typeof SCreateInventory>;
export class CreateInventoryDto extends createZodDto(SCreateInventory) {}
