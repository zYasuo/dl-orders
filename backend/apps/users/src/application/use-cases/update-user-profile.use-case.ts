import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserProfile } from '../../domain/entities/user-profile.entity';
import { IUserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';
import type { TUpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UpdateUserProfileUseCase {
    constructor(private readonly userProfileRepository: IUserProfileRepositoryPort) {}

    async execute(userId: string, input: TUpdateUserProfileDto): Promise<UserProfile> {
        const { name } = input;

        const profile = await this.userProfileRepository.update(userId, {
            name,
        });

        if (!profile) {
            throw new NotFoundException('User profile not found');
        }

        return profile;
    }
}
