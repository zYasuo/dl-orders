import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SFindAllInventoryQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type TFindAllInventoryQuery = z.infer<typeof SFindAllInventoryQuery>;
export class FindAllInventoryQueryDto extends createZodDto(SFindAllInventoryQuery) {}
