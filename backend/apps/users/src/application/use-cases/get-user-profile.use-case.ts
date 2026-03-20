import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepositoryPort) {}

  async execute(userId: string): Promise<UserProfileEntity> {
    const profile = await this.userProfileRepository.findById(userId);

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }
}
