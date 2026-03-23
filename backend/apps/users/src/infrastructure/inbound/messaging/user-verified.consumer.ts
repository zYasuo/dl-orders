import { PATTERNS, UserVerifiedEvent } from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ProvisionUserProfileUseCase } from '../../../application/use-cases/provision-user-profile.use-case';

@Controller()
export class UserVerifiedConsumer {
  private readonly logger = new Logger(UserVerifiedConsumer.name);

  constructor(private readonly provisionUserProfileUseCase: ProvisionUserProfileUseCase) {}

  @EventPattern(PATTERNS.USER_VERIFIED)
  async handle(@Payload() payload: UserVerifiedEvent): Promise<void> {
    const { userId, email, name } = payload;

    this.logger.log('Received user.verified', { userId, email, name });

    await this.provisionUserProfileUseCase.execute({
      userId,
      email,
      name: name ?? null,
    });
  }
}
