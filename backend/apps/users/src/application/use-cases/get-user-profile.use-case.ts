import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserProfile } from '../../domain/entities/user-profile.entity';
import { IUserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';

@Injectable()
export class GetUserProfileUseCase {
    constructor(private readonly userProfileRepository: IUserProfileRepositoryPort) {}

    async execute(userId: string): Promise<UserProfile> {
        const profile = await this.userProfileRepository.findById(userId);

        if (!profile) {
            throw new NotFoundException('User profile not found');
        }

        return profile;
    }
}
