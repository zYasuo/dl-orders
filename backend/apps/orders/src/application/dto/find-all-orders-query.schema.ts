import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SFindAllOrdersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type TFindAllOrdersQuery = z.infer<typeof SFindAllOrdersQuery>;
export class FindAllOrdersQueryDto extends createZodDto(SFindAllOrdersQuery) {}
