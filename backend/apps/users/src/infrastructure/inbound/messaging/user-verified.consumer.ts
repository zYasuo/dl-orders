import { PATTERNS, UserVerifiedEvent } from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IUserProfileRepositoryPort } from '../../../domain/ports/user-profile-repository.port';

@Controller()
export class UserVerifiedConsumer {
    private readonly logger = new Logger(UserVerifiedConsumer.name);

    constructor(private readonly userProfileRepository: IUserProfileRepositoryPort) {}

    @EventPattern(PATTERNS.USER_VERIFIED)
    async handle(@Payload() payload: UserVerifiedEvent): Promise<void> {
        const { userId, email, name } = payload;

        this.logger.log('Received user.verified', { userId, email, name });

        await this.userProfileRepository.create({ id: userId, email, name: name ?? null });
    }
}
