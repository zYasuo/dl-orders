import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SUpdateUserProfile = z.object({
    name: z.string().min(1).max(200).optional().nullable(),
});

export type TUpdateUserProfileDto = z.infer<typeof SUpdateUserProfile>;
export class UpdateUserProfileDto extends createZodDto(SUpdateUserProfile) {}
