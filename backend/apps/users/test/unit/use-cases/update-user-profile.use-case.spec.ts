import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserProfileUseCase } from '../../../src/application/use-cases/update-user-profile.use-case';
import { UserProfile } from '../../../src/domain/entities/user-profile.entity';
import { IUserProfileRepositoryPort } from '../../../src/domain/ports/user-profile-repository.port';

describe('UpdateUserProfileUseCase', () => {
    let sut: UpdateUserProfileUseCase;
    let userProfileRepository: jest.Mocked<IUserProfileRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const updatedProfile = new UserProfile({
        id: 'user-123',
        email: 'user@test.com',
        name: 'Updated Name',
        createdAt,
        updatedAt: new Date('2025-01-02T12:00:00Z'),
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        userProfileRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn().mockResolvedValue(updatedProfile),
        } as unknown as jest.Mocked<IUserProfileRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateUserProfileUseCase,
                { provide: IUserProfileRepositoryPort, useValue: userProfileRepository },
            ],
        }).compile();

        sut = module.get(UpdateUserProfileUseCase);
    });

    describe('execute', () => {
        it('updates profile and returns updated entity', async () => {
            const input = { name: 'Updated Name' };

            const result = await sut.execute('user-123', input);

            expect(userProfileRepository.update).toHaveBeenCalledWith('user-123', { name: input.name });
            expect(result).toEqual(updatedProfile);
            expect(result.name).toBe('Updated Name');
        });

        it('throws NotFoundException when profile does not exist', async () => {
            userProfileRepository.update.mockResolvedValueOnce(null);
            const input = { name: 'New Name' };

            await expect(sut.execute('non-existent', input)).rejects.toThrow(/User profile not found/);
        });
    });
});
