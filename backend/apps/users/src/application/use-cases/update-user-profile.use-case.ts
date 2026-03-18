import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { IUserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';
import type { TUpdateUserProfile } from '../../domain/types/user-profile-repository.types';
import type { TUpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(private readonly userProfileRepository: IUserProfileRepositoryPort) {}

  async execute(userId: string, input: TUpdateUserProfileDto): Promise<UserProfileEntity> {
    const updateData: TUpdateUserProfile = { name: input.name };

    const profile = await this.userProfileRepository.update(userId, updateData);

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }
}
