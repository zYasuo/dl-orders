import { Test, TestingModule } from '@nestjs/testing';
import { ProvisionUserProfileUseCase } from '../../../src/application/use-cases/provision-user-profile.use-case';
import { UserProfileRepositoryPort } from '../../../src/domain/ports/user-profile-repository.port';

describe('ProvisionUserProfileUseCase', () => {
  let sut: ProvisionUserProfileUseCase;
  let userProfileRepository: jest.Mocked<UserProfileRepositoryPort>;

  beforeEach(async () => {
    jest.clearAllMocks();
    userProfileRepository = {
      create: jest.fn(),
      ensureExists: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<UserProfileRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvisionUserProfileUseCase,
        { provide: UserProfileRepositoryPort, useValue: userProfileRepository },
      ],
    }).compile();

    sut = module.get(ProvisionUserProfileUseCase);
  });

  it('calls ensureExists with profile entity', async () => {
    await sut.execute({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'u@test.com',
      name: 'N',
    });

    expect(userProfileRepository.ensureExists).toHaveBeenCalledTimes(1);
    const arg = userProfileRepository.ensureExists.mock.calls[0][0];
    expect(arg.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(arg.email).toBe('u@test.com');
    expect(arg.name).toBe('N');
  });
});
