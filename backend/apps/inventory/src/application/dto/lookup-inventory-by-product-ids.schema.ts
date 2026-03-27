import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SLookupInventoryByProductIds = z.object({
  productIds: z.array(z.string().min(1).max(36)).min(1).max(50),
});

export type TLookupInventoryByProductIds = z.infer<typeof SLookupInventoryByProductIds>;
export class LookupInventoryByProductIdsDto extends createZodDto(SLookupInventoryByProductIds) {}
