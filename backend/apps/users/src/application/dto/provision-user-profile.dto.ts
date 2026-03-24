import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email } from '@app/shared/domain';

export const SProvisionUserProfile = z.object({
  userId: z.uuid(),
  email: z.email('email must be valid').max(Email.MAX_LENGTH, `email must be less than ${Email.MAX_LENGTH} characters`),
  name: z.string().min(1).max(200).nullable().optional(),
});

export type TProvisionUserProfileDto = z.infer<typeof SProvisionUserProfile>;
export class ProvisionUserProfileDto extends createZodDto(SProvisionUserProfile) {}
