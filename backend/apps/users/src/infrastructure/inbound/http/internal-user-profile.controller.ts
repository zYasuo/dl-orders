import { ZodValidationPipe } from '@app/shared';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
  SProvisionUserProfile,
  type TProvisionUserProfileDto,
} from '../../../application/dto/provision-user-profile.dto';
import { ProvisionUserProfileUseCase } from '../../../application/use-cases/provision-user-profile.use-case';
import { InternalApiSecretGuard } from './guards/internal-api-secret.guard';

@ApiExcludeController()
@Controller('internal/user-profiles')
export class InternalUserProfileController {
  constructor(private readonly provisionUserProfileUseCase: ProvisionUserProfileUseCase) {}

  @Post()
  @UseGuards(InternalApiSecretGuard)
  async provision(@Body(new ZodValidationPipe(SProvisionUserProfile)) body: TProvisionUserProfileDto) {
    await this.provisionUserProfileUseCase.execute({
      userId: body.userId,
      email: body.email,
      name: body.name ?? null,
    });
    return { ok: true as const };
  }
}
