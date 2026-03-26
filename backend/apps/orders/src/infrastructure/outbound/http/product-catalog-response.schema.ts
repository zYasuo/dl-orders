import { z } from 'zod';

export const SProductCatalogPayload = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
});
