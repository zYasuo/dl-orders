import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SCreateResetPasswordLinkDto = z.object({
  email: z.email('email must be valid').max(254, 'email must be less than 254 characters'),
});

export type TCreateResetPasswordLink = z.infer<typeof SCreateResetPasswordLinkDto>;
export class CreateResetPasswordLinkDto extends createZodDto(SCreateResetPasswordLinkDto) {}
