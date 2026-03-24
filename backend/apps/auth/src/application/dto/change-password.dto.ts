import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Email } from '@app/shared/domain';

export const SChangePasswordDto = z.object({
  email: z.email('email must be valid').max(Email.MAX_LENGTH, `email must be less than ${Email.MAX_LENGTH} characters`),
  token: z.string().min(1).max(255),
  new_password: z.string().min(12).max(64),
});

export type TChangePassword = z.infer<typeof SChangePasswordDto>;
export class ChangePasswordDto extends createZodDto(SChangePasswordDto) {}
