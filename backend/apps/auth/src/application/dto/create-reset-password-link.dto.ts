import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email } from '@app/shared/domain';

export const SCreateResetPasswordLinkDto = z.object({
  email: z.email('email must be valid').max(Email.MAX_LENGTH, `email must be less than ${Email.MAX_LENGTH} characters`),
});

export type TCreateResetPasswordLink = z.infer<typeof SCreateResetPasswordLinkDto>;
export class CreateResetPasswordLinkDto extends createZodDto(SCreateResetPasswordLinkDto) {}
