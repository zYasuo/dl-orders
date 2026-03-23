import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SProvisionUserProfile = z.object({
  userId: z.uuid(),
  email: z.email(),
  name: z.string().min(1).max(200).nullable().optional(),
});

export type TProvisionUserProfileDto = z.infer<typeof SProvisionUserProfile>;
export class ProvisionUserProfileDto extends createZodDto(SProvisionUserProfile) {}
