import { PATTERNS, UserVerifiedEvent } from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserProfileEntity } from '../../../domain/entities/user-profile.entity';
import { UserProfileRepositoryPort } from '../../../domain/ports/user-profile-repository.port';

@Controller()
export class UserVerifiedConsumer {
  private readonly logger = new Logger(UserVerifiedConsumer.name);

  constructor(private readonly userProfileRepository: UserProfileRepositoryPort) {}

  @EventPattern(PATTERNS.USER_VERIFIED)
  async handle(@Payload() payload: UserVerifiedEvent): Promise<void> {
    const { userId, email, name } = payload;

    this.logger.log('Received user.verified', { userId, email, name });

    await this.userProfileRepository.create(
      UserProfileEntity.create({
        id: userId,
        email,
        name: name ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }
}
