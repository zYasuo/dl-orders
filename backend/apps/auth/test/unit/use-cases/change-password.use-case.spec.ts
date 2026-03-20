import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from '../../../src/application/use-cases/change-password.use-case';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { PasswordChangedPublisherPort } from '../../../src/domain/ports/publishers/password-changed-publisher.port';
import { AuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { PasswordResetRepositoryPort } from '../../../src/domain/ports/repositories/password-reset-repository.port';
import { EmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.port';
import { PasswordHasherPort } from '../../../src/domain/ports/security/password-hasher.port';

describe('ChangePasswordUseCase', () => {
  let sut: ChangePasswordUseCase;
  let passwordResetRepository: jest.Mocked<PasswordResetRepositoryPort>;
  let authUserRepository: jest.Mocked<AuthUserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let emailEncrypted: jest.Mocked<EmailEncryptedSecurity>;
  let passwordChangedPublisher: jest.Mocked<PasswordChangedPublisherPort>;

  const emailLookupHash = 'lookup-hash-123';
  const fakeUser = new UserEntity({
    id: 'user-1',
    emailEncrypted: 'enc',
    emailLookupHash,
    passwordHash: 'oldHash',
    name: 'User',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const input = {
    email: 'user@test.com',
    token: 'token-123',
    new_password: 'newSecurePassword12!',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    passwordResetRepository = {
      create: jest.fn(),
      findByLinkResetPassword: jest.fn(),
      findByEmailLookupHash: jest.fn(),
      consumeToken: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<PasswordResetRepositoryPort>;

    authUserRepository = {
      create: jest.fn(),
      findByEmailLookupHash: jest.fn().mockResolvedValue(fakeUser),
      markEmailVerified: jest.fn(),
      changePassword: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<AuthUserRepositoryPort>;

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashedPassword'),
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordHasherPort>;

    emailEncrypted = {
      getLookupHash: jest.fn().mockResolvedValue(emailLookupHash),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    } as unknown as jest.Mocked<EmailEncryptedSecurity>;

    passwordChangedPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PasswordChangedPublisherPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        { provide: PasswordResetRepositoryPort, useValue: passwordResetRepository },
        { provide: AuthUserRepositoryPort, useValue: authUserRepository },
        { provide: PasswordHasherPort, useValue: passwordHasher },
        { provide: EmailEncryptedSecurity, useValue: emailEncrypted },
        { provide: PasswordChangedPublisherPort, useValue: passwordChangedPublisher },
      ],
    }).compile();

    sut = module.get(ChangePasswordUseCase);
  });

  describe('execute', () => {
    it('consumes token, finds user by email lookup hash, changes password and publishes password changed', async () => {
      const result = await sut.execute(input);

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(emailEncrypted.getLookupHash).toHaveBeenCalledWith(input.email);
      expect(passwordResetRepository.consumeToken).toHaveBeenCalledWith(
        input.token,
        emailLookupHash,
      );
      expect(authUserRepository.findByEmailLookupHash).toHaveBeenCalledWith(emailLookupHash);
      expect(passwordHasher.hash).toHaveBeenCalledWith(input.new_password);
      expect(authUserRepository.changePassword).toHaveBeenCalledWith(fakeUser.id, 'hashedPassword');
      expect(passwordChangedPublisher.publish).toHaveBeenCalledTimes(1);
      expect(passwordChangedPublisher.publish).toHaveBeenCalledWith({
        email: input.email,
        changedAt: expect.any(Date),
      });
    });

    it('throws BadRequestException when token is not consumed (already used or expired)', async () => {
      passwordResetRepository.consumeToken.mockResolvedValueOnce(false);

      await expect(sut.execute(input)).rejects.toThrow(BadRequestException);
      expect(passwordChangedPublisher.publish).not.toHaveBeenCalled();
      expect(authUserRepository.changePassword).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user is not found and does not publish', async () => {
      authUserRepository.findByEmailLookupHash.mockResolvedValueOnce(null);

      await expect(sut.execute(input)).rejects.toThrow(NotFoundException);
      expect(passwordChangedPublisher.publish).not.toHaveBeenCalled();
      expect(authUserRepository.changePassword).not.toHaveBeenCalled();
    });
  });
});

