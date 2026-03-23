import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VerifyOtpUseCase } from '../../../src/application/use-cases/verify-otp.use-case';
import * as crypto from 'node:crypto';
import { OtpCodeEntity } from '../../../src/domain/entities/otp-code.entity';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { AuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.port';
import { JwtPort } from '../../../src/domain/ports/security/jwt.port';
import { OtpRepositoryPort } from '../../../src/domain/ports/repositories/otp-repository.port';
import { UserVerifiedPublisherPort } from '../../../src/domain/ports/publishers/user-verified-publisher.port';
import { UserProfileProvisionerPort } from '../../../src/domain/ports/user-profile-provisioner.port';
import { FakeEmailEncryptedSecurity } from '../../doubles/fake-email-encrypted.security';
import { FakeJwtPort } from '../../doubles/fake-jwt.port';
import { FakeUserProfileProvisioner } from '../../doubles/fake-user-profile-provisioner';
import { FakeUserVerifiedPublisher } from '../../doubles/fake-user-verified.publisher';
import { InMemoryAuthUserRepository } from '../../doubles/in-memory-auth-user.repository';
import { InMemoryOtpRepository } from '../../doubles/in-memory-otp.repository';

describe('VerifyOtpUseCase (integration)', () => {
  let sut: VerifyOtpUseCase;
  let authUserRepository: InMemoryAuthUserRepository;
  let otpRepository: InMemoryOtpRepository;
  let userVerifiedPublisher: FakeUserVerifiedPublisher;
  let userProfileProvisioner: FakeUserProfileProvisioner;
  let jwtPort: FakeJwtPort;

  beforeEach(async () => {
    authUserRepository = new InMemoryAuthUserRepository();
    otpRepository = new InMemoryOtpRepository();
    userVerifiedPublisher = new FakeUserVerifiedPublisher();
    userProfileProvisioner = new FakeUserProfileProvisioner();
    jwtPort = new FakeJwtPort();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyOtpUseCase,
        { provide: AuthUserRepositoryPort, useValue: authUserRepository },
        { provide: EmailEncryptedSecurity, useClass: FakeEmailEncryptedSecurity },
        { provide: OtpRepositoryPort, useValue: otpRepository },
        { provide: JwtPort, useValue: jwtPort },
        { provide: UserVerifiedPublisherPort, useValue: userVerifiedPublisher },
        { provide: UserProfileProvisionerPort, useValue: userProfileProvisioner },
      ],
    }).compile();

    sut = module.get(VerifyOtpUseCase);
  });

  describe('execute', () => {
    it('marks OTP used, marks user verified, publishes event and returns accessToken', async () => {
      const user = await authUserRepository.create(
        UserEntity.create({
          emailEncrypted: 'user@test.com',
          emailLookupHash: 'user@test.com',
          passwordHash: 'hash',
          name: 'User',
        }),
      );
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await otpRepository.create(
        new OtpCodeEntity({
          id: crypto.randomUUID(),
          code: '123456',
          userId: user!.id,
          expiresAt,
          used: false,
          createdAt: new Date(),
        }),
      );

      const result = await sut.execute({ email: 'user@test.com', code: '123456' });

      expect(result.accessToken).toBe(`fake-jwt-${user!.id}`);

      const updatedUser = await authUserRepository.findByEmailLookupHash('user@test.com');
      expect(updatedUser!.emailVerified).toBe(true);

      const otp = await otpRepository.findLatestByUserId(user!.id);
      expect(otp!.used).toBe(true);

      expect(userProfileProvisioner.provisioned).toHaveLength(1);
      expect(userProfileProvisioner.provisioned[0].userId).toBe(user!.id);
      expect(userProfileProvisioner.provisioned[0].email).toBe('user@test.com');

      expect(userVerifiedPublisher.published).toHaveLength(1);
      expect(userVerifiedPublisher.published[0].userId).toBe(user!.id);
      expect(userVerifiedPublisher.published[0].email).toBe('user@test.com');
    });

    it('throws BadRequestException when user is not found', async () => {
      await expect(sut.execute({ email: 'unknown@test.com', code: '123456' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'unknown@test.com', code: '123456' })).rejects.toThrow(
        /Invalid email or code/,
      );
    });

    it('throws BadRequestException when OTP is not found', async () => {
      await authUserRepository.create(
        UserEntity.create({
          emailEncrypted: 'user@test.com',
          emailLookupHash: 'user@test.com',
          passwordHash: 'h',
          name: null,
        }),
      );

      await expect(sut.execute({ email: 'user@test.com', code: '123456' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'user@test.com', code: '123456' })).rejects.toThrow(
        /Invalid email or code/,
      );
    });

    it('throws BadRequestException when code does not match', async () => {
      const user = await authUserRepository.create(
        UserEntity.create({
          emailEncrypted: 'user@test.com',
          emailLookupHash: 'user@test.com',
          passwordHash: 'h',
          name: null,
        }),
      );

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await otpRepository.create(
        new OtpCodeEntity({
          id: crypto.randomUUID(),
          code: '123456',
          userId: user!.id,
          expiresAt,
          used: false,
          createdAt: new Date(),
        }),
      );

      await expect(sut.execute({ email: 'user@test.com', code: '999999' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'user@test.com', code: '999999' })).rejects.toThrow(
        /Invalid email or code/,
      );
    });

    it('throws BadRequestException when code is expired', async () => {
      const user = await authUserRepository.create(
        UserEntity.create({
          emailEncrypted: 'user@test.com',
          emailLookupHash: 'user@test.com',
          passwordHash: 'h',
          name: null,
        }),
      );

      const expiresAt = new Date(Date.now() - 60 * 1000);
      await otpRepository.create(
        new OtpCodeEntity({
          id: crypto.randomUUID(),
          code: '123456',
          userId: user!.id,
          expiresAt,
          used: false,
          createdAt: new Date(),
        }),
      );

      await expect(sut.execute({ email: 'user@test.com', code: '123456' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(sut.execute({ email: 'user@test.com', code: '123456' })).rejects.toThrow(
        /Code expired/,
      );
    });
  });
});


