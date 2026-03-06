import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VerifyOtpUseCase } from '../../../src/application/use-cases/verify-otp.use-case';
import { OtpCode } from '../../../src/domain/entities/otp-code.entity';
import { User } from '../../../src/domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../../src/domain/ports/auth-user-repository.port';
import { IJwtPort } from '../../../src/domain/ports/jwt.port';
import { IOtpRepositoryPort } from '../../../src/domain/ports/otp-repository.port';
import { IUserVerifiedPublisherPort } from '../../../src/domain/ports/user-verified-publisher.port';

describe('VerifyOtpUseCase', () => {
    let sut: VerifyOtpUseCase;
    let authUserRepository: jest.Mocked<IAuthUserRepositoryPort>;
    let otpRepository: jest.Mocked<IOtpRepositoryPort>;
    let jwtPort: jest.Mocked<IJwtPort>;
    let userVerifiedPublisher: jest.Mocked<IUserVerifiedPublisherPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const futureExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const pastExpiry = new Date(Date.now() - 60 * 1000);

    const fakeUser = new User({
        id: 'user-123',
        email: 'user@test.com',
        passwordHash: 'hashed',
        name: 'User Name',
        emailVerified: false,
        createdAt,
        updatedAt: createdAt,
    });

    const verifiedUserInstance = new User({
        id: fakeUser.id,
        email: fakeUser.email,
        passwordHash: fakeUser.passwordHash,
        name: fakeUser.name,
        emailVerified: true,
        createdAt,
        updatedAt: createdAt,
    });

    const validOtp = new OtpCode({
        id: 'otp-1',
        code: '123456',
        userId: fakeUser.id,
        expiresAt: futureExpiry,
        used: false,
        createdAt,
    });

    const usedOtp = new OtpCode({
        id: 'otp-1',
        code: '123456',
        userId: fakeUser.id,
        expiresAt: futureExpiry,
        used: true,
        createdAt,
    });

    const expiredOtp = new OtpCode({
        id: 'otp-1',
        code: '123456',
        userId: fakeUser.id,
        expiresAt: pastExpiry,
        used: false,
        createdAt,
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        authUserRepository = {
            create: jest.fn(),
            findByEmail: jest.fn().mockResolvedValue(fakeUser),
            markEmailVerified: jest.fn().mockResolvedValue(verifiedUserInstance),
        } as unknown as jest.Mocked<IAuthUserRepositoryPort>;

        otpRepository = {
            create: jest.fn(),
            findLatestByUserId: jest.fn().mockResolvedValue(validOtp),
            markUsed: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IOtpRepositoryPort>;

        jwtPort = {
            sign: jest.fn().mockResolvedValue('jwt-token'),
            verify: jest.fn(),
        } as unknown as jest.Mocked<IJwtPort>;

        userVerifiedPublisher = {
            publish: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IUserVerifiedPublisherPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VerifyOtpUseCase,
                { provide: IAuthUserRepositoryPort, useValue: authUserRepository },
                { provide: IOtpRepositoryPort, useValue: otpRepository },
                { provide: IJwtPort, useValue: jwtPort },
                { provide: IUserVerifiedPublisherPort, useValue: userVerifiedPublisher },
            ],
        }).compile();

        sut = module.get(VerifyOtpUseCase);
    });

    describe('execute', () => {
        it('marks OTP used, marks user verified, publishes event and returns accessToken', async () => {
            const input = { email: 'user@test.com', code: '123456' };

            const result = await sut.execute(input);

            expect(authUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
            expect(otpRepository.findLatestByUserId).toHaveBeenCalledWith(fakeUser.id);
            expect(otpRepository.markUsed).toHaveBeenCalledWith(validOtp.id);
            expect(authUserRepository.markEmailVerified).toHaveBeenCalledWith(fakeUser.id);
            expect(userVerifiedPublisher.publish).toHaveBeenCalledWith({
                userId: verifiedUserInstance.id,
                email: verifiedUserInstance.email,
                name: verifiedUserInstance.name,
            });
            expect(jwtPort.sign).toHaveBeenCalledWith({ sub: fakeUser.id, email: fakeUser.email });
            expect(result).toEqual({ accessToken: 'jwt-token' });
        });

        it('throws BadRequestException when user is not found', async () => {
            authUserRepository.findByEmail.mockResolvedValueOnce(null);
            const input = { email: 'unknown@test.com', code: '123456' };

            await expect(sut.execute(input)).rejects.toThrow(/Invalid email or code/);

            expect(otpRepository.findLatestByUserId).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when OTP is not found', async () => {
            otpRepository.findLatestByUserId.mockResolvedValueOnce(null);
            const input = { email: 'user@test.com', code: '123456' };

            await expect(sut.execute(input)).rejects.toThrow(/Invalid email or code/);

            expect(otpRepository.markUsed).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when code does not match', async () => {
            const input = { email: 'user@test.com', code: '999999' };

            await expect(sut.execute(input)).rejects.toThrow(/Invalid email or code/);

            expect(otpRepository.markUsed).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when code was already used', async () => {
            otpRepository.findLatestByUserId.mockResolvedValueOnce(usedOtp);
            const input = { email: 'user@test.com', code: '123456' };

            await expect(sut.execute(input)).rejects.toThrow(/Code already used/);

            expect(otpRepository.markUsed).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when code is expired', async () => {
            otpRepository.findLatestByUserId.mockResolvedValueOnce(expiredOtp);
            const input = { email: 'user@test.com', code: '123456' };

            await expect(sut.execute(input)).rejects.toThrow(/Code expired/);

            expect(otpRepository.markUsed).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });
    });
});
