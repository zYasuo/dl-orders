import { Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';
import type { TUpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepositoryPort) {}

  async execute(userId: string, input: TUpdateUserProfileDto): Promise<UserProfileEntity> {
    const currentProfile = await this.userProfileRepository.findById(userId);
    if (!currentProfile) {
      throw new NotFoundException('User profile not found');
    }
    const profile = await this.userProfileRepository.update(
      new UserProfileEntity({
        id: currentProfile.id,
        email: currentProfile.email,
        name: input.name ?? currentProfile.name,
        createdAt: currentProfile.createdAt,
        updatedAt: new Date(),
      }),
    );

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }
}
