import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SigninUseCase } from '../../../src/application/use-cases/signin.use-case';
import { User } from '../../../src/domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../../src/domain/ports/auth-user-repository.port';
import { IJwtPort } from '../../../src/domain/ports/jwt.port';
import { IPasswordHasherPort } from '../../../src/domain/ports/password-hasher.port';

describe('SigninUseCase', () => {
    let sut: SigninUseCase;
    let authUserRepository: jest.Mocked<IAuthUserRepositoryPort>;
    let passwordHasher: jest.Mocked<IPasswordHasherPort>;
    let jwtPort: jest.Mocked<IJwtPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const verifiedUser = new User({
        id: 'user-123',
        email: 'user@test.com',
        passwordHash: 'hashed',
        name: 'User',
        emailVerified: true,
        createdAt,
        updatedAt: createdAt,
    });

    const unverifiedUser = new User({
        id: 'user-123',
        email: 'user@test.com',
        passwordHash: 'hashed',
        name: 'User',
        emailVerified: false,
        createdAt,
        updatedAt: createdAt,
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        authUserRepository = {
            create: jest.fn(),
            findByEmail: jest.fn().mockResolvedValue(verifiedUser),
            markEmailVerified: jest.fn(),
        } as unknown as jest.Mocked<IAuthUserRepositoryPort>;

        passwordHasher = {
            hash: jest.fn(),
            compare: jest.fn().mockResolvedValue(true),
        } as unknown as jest.Mocked<IPasswordHasherPort>;

        jwtPort = {
            sign: jest.fn().mockResolvedValue('jwt-token'),
            verify: jest.fn(),
        } as unknown as jest.Mocked<IJwtPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SigninUseCase,
                { provide: IAuthUserRepositoryPort, useValue: authUserRepository },
                { provide: IPasswordHasherPort, useValue: passwordHasher },
                { provide: IJwtPort, useValue: jwtPort },
            ],
        }).compile();

        sut = module.get(SigninUseCase);
    });

    describe('execute', () => {
        it('returns accessToken when credentials and email are verified', async () => {
            const input = { email: 'user@test.com', password: 'password123' };

            const result = await sut.execute(input);

            expect(authUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
            expect(passwordHasher.compare).toHaveBeenCalledWith(input.password, verifiedUser.passwordHash);
            expect(jwtPort.sign).toHaveBeenCalledWith({ sub: verifiedUser.id, email: verifiedUser.email });
            expect(result).toEqual({ accessToken: 'jwt-token' });
        });

        it('throws BadRequestException when user is not found', async () => {
            authUserRepository.findByEmail.mockResolvedValueOnce(null);
            const input = { email: 'unknown@test.com', password: 'password123' };

            await expect(sut.execute(input)).rejects.toThrow(/Invalid email or password/);

            expect(passwordHasher.compare).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when email is not verified', async () => {
            authUserRepository.findByEmail.mockResolvedValueOnce(unverifiedUser);
            const input = { email: 'user@test.com', password: 'password123' };

            await expect(sut.execute(input)).rejects.toThrow(/Email not verified/);

            expect(passwordHasher.compare).not.toHaveBeenCalled();
            expect(jwtPort.sign).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when password is invalid', async () => {
            passwordHasher.compare.mockResolvedValueOnce(false);
            const input = { email: 'user@test.com', password: 'wrongpassword' };

            await expect(sut.execute(input)).rejects.toThrow(/Invalid email or password/);

            expect(jwtPort.sign).not.toHaveBeenCalled();
        });
    });
});
