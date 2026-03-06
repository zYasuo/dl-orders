import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserProfileUseCase } from '../../../src/application/use-cases/get-user-profile.use-case';
import { UserProfile } from '../../../src/domain/entities/user-profile.entity';
import { IUserProfileRepositoryPort } from '../../../src/domain/ports/user-profile-repository.port';

describe('GetUserProfileUseCase', () => {
    let sut: GetUserProfileUseCase;
    let userProfileRepository: jest.Mocked<IUserProfileRepositoryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProfile = new UserProfile({
        id: 'user-123',
        email: 'user@test.com',
        name: 'User Name',
        createdAt,
        updatedAt: createdAt,
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        userProfileRepository = {
            create: jest.fn(),
            findById: jest.fn().mockResolvedValue(fakeProfile),
            update: jest.fn(),
        } as unknown as jest.Mocked<IUserProfileRepositoryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserProfileUseCase,
                { provide: IUserProfileRepositoryPort, useValue: userProfileRepository },
            ],
        }).compile();

        sut = module.get(GetUserProfileUseCase);
    });

    describe('execute', () => {
        it('returns profile when found', async () => {
            const result = await sut.execute('user-123');

            expect(userProfileRepository.findById).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(fakeProfile);
            expect(result.id).toBe(fakeProfile.id);
            expect(result.email).toBe(fakeProfile.email);
            expect(result.name).toBe(fakeProfile.name);
        });

        it('throws NotFoundException when profile does not exist', async () => {
            userProfileRepository.findById.mockResolvedValueOnce(null);

            await expect(sut.execute('non-existent')).rejects.toThrow(/User profile not found/);
        });
    });
});
