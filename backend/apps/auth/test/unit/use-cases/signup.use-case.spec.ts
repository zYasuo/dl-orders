import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SignupUseCase } from '../../../src/application/use-cases/signup.use-case';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../../src/domain/ports/repositories/auth-user-repository.port';
import { IEmailEncryptedSecurity } from '../../../src/domain/ports/security/email-encrypted.security';
import { IOtpRepositoryPort } from '../../../src/domain/ports/repositories/otp-repository.port';
import { IOtpSendRequestedPublisherPort } from '../../../src/domain/ports/publishers/otp-send-requested-publisher.port';
import { IPasswordHasherPort } from '../../../src/domain/ports/security/password-hasher.port';

describe('SignupUseCase', () => {
    let sut: SignupUseCase;
    let authUserRepository: jest.Mocked<IAuthUserRepositoryPort>;
    let emailEncrypted: jest.Mocked<IEmailEncryptedSecurity>;
    let otpRepository: jest.Mocked<IOtpRepositoryPort>;
    let passwordHasher: jest.Mocked<IPasswordHasherPort>;
    let otpSendRequestedPublisher: jest.Mocked<IOtpSendRequestedPublisherPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeUser = new UserEntity({
        id: 'user-123',
        emailEncrypted: 'enc-user@test.com',
        emailLookupHash: 'user@test.com',
        passwordHash: 'hashed',
        name: 'User Name',
        emailVerified: false,
        createdAt,
        updatedAt: createdAt,
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        authUserRepository = {
            create: jest.fn().mockResolvedValue(fakeUser),
            findByEmailLookupHash: jest.fn().mockResolvedValue(null),
            markEmailVerified: jest.fn(),
        } as unknown as jest.Mocked<IAuthUserRepositoryPort>;

        emailEncrypted = {
            encrypt: jest.fn().mockImplementation((v: string) => Promise.resolve(v)),
            decrypt: jest.fn().mockImplementation((v: string) => Promise.resolve(v)),
            getLookupHash: jest.fn().mockImplementation((v: string) => Promise.resolve(v.toLowerCase().trim())),
        } as unknown as jest.Mocked<IEmailEncryptedSecurity>;

        otpRepository = {
            create: jest.fn().mockResolvedValue(undefined),
            findLatestByUserId: jest.fn(),
            markUsedIfUnused: jest.fn(),
        } as unknown as jest.Mocked<IOtpRepositoryPort>;

        passwordHasher = {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn(),
        } as unknown as jest.Mocked<IPasswordHasherPort>;

        otpSendRequestedPublisher = {
            publish: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IOtpSendRequestedPublisherPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SignupUseCase,
                { provide: IAuthUserRepositoryPort, useValue: authUserRepository },
                { provide: IEmailEncryptedSecurity, useValue: emailEncrypted },
                { provide: IOtpRepositoryPort, useValue: otpRepository },
                { provide: IPasswordHasherPort, useValue: passwordHasher },
                { provide: IOtpSendRequestedPublisherPort, useValue: otpSendRequestedPublisher },
            ],
        }).compile();

        sut = module.get(SignupUseCase);
    });

    describe('execute', () => {
        it('creates user, OTP and publishes OTP send event when email is not registered', async () => {
            const input = { email: 'user@test.com', password: 'password123', name: 'User Name' };

            const result = await sut.execute(input);

            expect(emailEncrypted.getLookupHash).toHaveBeenCalledWith(input.email);
            expect(emailEncrypted.getLookupHash).toHaveBeenCalledWith(input.email);
            expect(authUserRepository.findByEmailLookupHash).toHaveBeenCalledWith('user@test.com');
            expect(emailEncrypted.encrypt).toHaveBeenCalledWith(input.email);
            expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);
            expect(authUserRepository.create).toHaveBeenCalledWith({
                emailEncrypted: input.email,
                emailLookupHash: 'user@test.com',
                passwordHash: 'hashed-password',
                name: input.name,
            });

            expect(otpRepository.create).toHaveBeenCalledTimes(1);
            expect(otpRepository.create).toHaveBeenCalledWith({
                code: expect.any(String),
                userId: fakeUser.id,
                expiresAt: expect.any(Date),
            });

            expect(otpSendRequestedPublisher.publish).toHaveBeenCalledTimes(1);
            expect(otpSendRequestedPublisher.publish).toHaveBeenCalledWith({
                email: input.email,
                code: expect.any(String),
                expiresInMinutes: expect.any(Number),
            });

            expect(result).toEqual({ userId: fakeUser.id, email: input.email });
        });

        it('throws ConflictException when email is already registered', async () => {
            authUserRepository.findByEmailLookupHash.mockResolvedValueOnce(fakeUser);
            const input = { email: 'user@test.com', password: 'password123', name: 'User' };

            await expect(sut.execute(input)).rejects.toThrow(/Email already registered/);

            expect(authUserRepository.create).not.toHaveBeenCalled();
            expect(otpRepository.create).not.toHaveBeenCalled();
            expect(otpSendRequestedPublisher.publish).not.toHaveBeenCalled();
        });

        it('throws when repository create returns null', async () => {
            authUserRepository.create.mockResolvedValueOnce(null);
            const input = { email: 'user@test.com', password: 'password123', name: 'User' };

            await expect(sut.execute(input)).rejects.toThrow('Failed to create user');

            expect(otpSendRequestedPublisher.publish).not.toHaveBeenCalled();
        });

        it('accepts optional name', async () => {
            const input = { email: 'user@test.com', password: 'password123' };

            await sut.execute(input);

            expect(authUserRepository.create).toHaveBeenCalledWith({
                emailEncrypted: input.email,
                emailLookupHash: input.email,
                passwordHash: 'hashed-password',
                name: null,
            });
        });
    });
});
