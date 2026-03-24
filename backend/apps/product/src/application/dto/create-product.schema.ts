import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SCreateProduct = z.object({
  name: z.string().min(1, 'name is required').max(200, 'name must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'description is required')
    .max(2000, 'description must be less than 2000 characters'),
  price: z.number().min(0, 'price is required').max(1000000, 'price must be less than 1000000'),
  imageUrl: z.url().max(2048, 'imageUrl must be less than 2048 characters').optional().nullable(),
});

export type TCreateProduct = z.infer<typeof SCreateProduct>;
export class CreateProductDto extends createZodDto(SCreateProduct) {}
