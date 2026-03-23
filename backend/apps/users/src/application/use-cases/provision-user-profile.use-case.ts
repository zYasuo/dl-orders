import { Injectable } from '@nestjs/common';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserProfileRepositoryPort } from '../../domain/ports/user-profile-repository.port';

export type TProvisionUserProfileInput = {
  userId: string;
  email: string;
  name: string | null;
};

@Injectable()
export class ProvisionUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepositoryPort) {}

  async execute(input: TProvisionUserProfileInput): Promise<void> {
    const now = new Date();
    await this.userProfileRepository.ensureExists(
      UserProfileEntity.create({
        id: input.userId,
        email: input.email,
        name: input.name,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }
}
