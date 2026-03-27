import { z } from 'zod';

export const SCartAbandonmentUpsert = z.object({
  sessionKey: z.string().min(8).max(64),
  email: z.string().email().max(254),
  resumeUrl: z.string().url().max(2000),
  pendingUntil: z.string().datetime(),
  summaryLines: z.string().max(2000),
});

export type TCartAbandonmentUpsert = z.infer<typeof SCartAbandonmentUpsert>;

export const SCartAbandonmentSessionKey = z.object({
  sessionKey: z.string().min(8).max(64),
});

export type TCartAbandonmentSessionKey = z.infer<typeof SCartAbandonmentSessionKey>;
