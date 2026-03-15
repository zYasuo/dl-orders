import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignupUseCase } from '../../../src/application/use-cases/signup.use-case';
import { IAuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { IEmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.security';
import { IOtpRepositoryPort } from '../../../src/domain/ports/repositories/otp-repository.port';
import { IOtpSendRequestedPublisherPort } from '../../../src/domain/ports/publishers/otp-send-requested-publisher.port';
import { IPasswordHasherPort } from '../../../src/domain/ports/security/password-hasher.port';
import { Argon2PasswordHasher } from '../../../src/infrastructure/outbound/security/argon2-password-hasher.security';
import { FakeEmailEncryptedSecurity } from '../../doubles/fake-email-encrypted.security';
import { FakeOtpSendRequestedPublisher } from '../../doubles/fake-otp-send-requested.publisher';
import { InMemoryAuthUserRepository } from '../../doubles/in-memory-auth-user.repository';
import { InMemoryOtpRepository } from '../../doubles/in-memory-otp.repository';

describe('SignupUseCase (integration)', () => {
    let sut: SignupUseCase;
    let authUserRepository: InMemoryAuthUserRepository;
    let otpRepository: InMemoryOtpRepository;
    let otpSendRequestedPublisher: FakeOtpSendRequestedPublisher;

    beforeEach(async () => {
        process.env.OTP_EXPIRES_IN_MINUTES = '10';
        authUserRepository = new InMemoryAuthUserRepository();
        otpRepository = new InMemoryOtpRepository();
        otpSendRequestedPublisher = new FakeOtpSendRequestedPublisher();
        const passwordHasher = new Argon2PasswordHasher();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SignupUseCase,
                { provide: IAuthUserRepositoryPort, useValue: authUserRepository },
                { provide: IEmailEncryptedSecurity, useClass: FakeEmailEncryptedSecurity },
                { provide: IOtpRepositoryPort, useValue: otpRepository },
                { provide: IPasswordHasherPort, useValue: passwordHasher },
                { provide: IOtpSendRequestedPublisherPort, useValue: otpSendRequestedPublisher },
            ],
        }).compile();

        sut = module.get(SignupUseCase);
    });

    describe('execute', () => {
        it('creates user, OTP and publishes OTP send event', async () => {
            const input = { email: 'user@test.com', password: 'password123', name: 'User Name' };

            const result = await sut.execute(input);

            expect(result.email).toBe(input.email);
            expect(result.userId).toBeDefined();

            const user = await authUserRepository.findByEmailLookupHash(input.email);
            expect(user).not.toBeNull();
            expect(user!.name).toBe(input.name);
            expect(user!.emailVerified).toBe(false);
            expect(user!.passwordHash).not.toBe(input.password);

            const otp = await otpRepository.findLatestByUserId(result.userId);
            expect(otp).not.toBeNull();
            expect(otp!.code).toHaveLength(6);
            expect(otp!.used).toBe(false);

            expect(otpSendRequestedPublisher.published).toHaveLength(1);
            expect(otpSendRequestedPublisher.published[0].email).toBe(input.email);
            expect(otpSendRequestedPublisher.published[0].code).toBe(otp!.code);
        });

        it('throws ConflictException when email is already registered', async () => {
            const input = { email: 'user@test.com', password: 'password123', name: 'User' };
            await sut.execute(input);

            await expect(sut.execute(input)).rejects.toThrow(ConflictException);
            await expect(sut.execute(input)).rejects.toThrow(/Email already registered/);
        });
    });

    describe('password validation', () => {
        it('throws BadRequestException when password is less than 12 characters', async () => {
            const input = { email: 'user@test.com', password: 'password', name: 'User' };
            await expect(sut.execute(input)).rejects.toThrow(BadRequestException);
            await expect(sut.execute(input)).rejects.toThrow(/password must be at least 12 characters/);
        });
        
        it('throws BadRequestException when password is more than 64 characters', async () => {
            const input = { email: 'user@test.com', password: 'password12345678901234567890123456789012345678901234567890123456789012345678901234567890', name: 'User' };
            await expect(sut.execute(input)).rejects.toThrow(BadRequestException);
            await expect(sut.execute(input)).rejects.toThrow(/password must be less than 64 characters/);
        });
    });
});
