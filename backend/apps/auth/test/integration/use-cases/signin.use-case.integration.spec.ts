import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SigninUseCase } from '../../../src/application/use-cases/signin.use-case';
import { IAuthUserRepositoryPort } from '../../../src/domain/ports/auth-user-repository.port';
import { IJwtPort } from '../../../src/domain/ports/jwt.port';
import { IPasswordHasherPort } from '../../../src/domain/ports/password-hasher.port';
import { FakeJwtPort } from '../../doubles/fake-jwt.port';
import { InMemoryAuthUserRepository } from '../../doubles/in-memory-auth-user.repository';
import { Argon2PasswordHasher } from '../../../src/infrastructure/outbound/security/argon2-password-hasher';

describe('SigninUseCase (integration)', () => {
    let sut: SigninUseCase;
    let authUserRepository: InMemoryAuthUserRepository;
    let jwtPort: FakeJwtPort;

    beforeEach(async () => {
        authUserRepository = new InMemoryAuthUserRepository();
        jwtPort = new FakeJwtPort();
        const passwordHasher = new Argon2PasswordHasher();

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
        it('returns accessToken when user exists, is verified and password matches', async () => {
            const password = 'password123';
            const hash = await new Argon2PasswordHasher().hash(password);
            const user = await authUserRepository.create({
                email: 'user@test.com',
                passwordHash: hash,
                name: 'User',
            });
            await authUserRepository.markEmailVerified(user!.id);

            const result = await sut.execute({ email: 'user@test.com', password });

            expect(result.accessToken).toBe(`fake-jwt-${user!.id}`);
        });

        it('throws BadRequestException when user is not found', async () => {
            await expect(sut.execute({ email: 'unknown@test.com', password: 'any' })).rejects.toThrow(BadRequestException);
            await expect(sut.execute({ email: 'unknown@test.com', password: 'any' })).rejects.toThrow(/Invalid email or password/);
        });

        it('throws BadRequestException when email is not verified', async () => {
            const password = 'password123';
            const hash = await new Argon2PasswordHasher().hash(password);
            await authUserRepository.create({ email: 'user@test.com', passwordHash: hash, name: 'User' });

            await expect(sut.execute({ email: 'user@test.com', password })).rejects.toThrow(BadRequestException);
            await expect(sut.execute({ email: 'user@test.com', password })).rejects.toThrow(/Email not verified/);
        });

        it('throws BadRequestException when password is invalid', async () => {
            const hash = await new Argon2PasswordHasher().hash('correct');
            const user = await authUserRepository.create({ email: 'user@test.com', passwordHash: hash, name: 'User' });
            await authUserRepository.markEmailVerified(user!.id);

            await expect(sut.execute({ email: 'user@test.com', password: 'wrong' })).rejects.toThrow(BadRequestException);
            await expect(sut.execute({ email: 'user@test.com', password: 'wrong' })).rejects.toThrow(/Invalid email or password/);
        });
    });
});
