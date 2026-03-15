import { UserEntity } from '../../src/domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../src/domain/ports/repositories/auth-user-repository.port';
import { TCreateAuthUser } from '../../src/domain/types/auth-user-repository.types';

export class InMemoryAuthUserRepository extends IAuthUserRepositoryPort {
    private readonly users = new Map<string, UserEntity>();

    async create(data: TCreateAuthUser): Promise<UserEntity | null> {
        const existing = Array.from(this.users.values()).find((u) => u.emailLookupHash === data.emailLookupHash);
        if (existing) return null;
        const user = UserEntity.create(data);
        this.users.set(user.id, user);
        return user;
    }

    async findByEmailLookupHash(emailLookupHash: string): Promise<UserEntity | null> {
        return Array.from(this.users.values()).find((u) => u.emailLookupHash === emailLookupHash) ?? null;
    }

    async markEmailVerified(id: string): Promise<UserEntity | null> {
        const user = this.users.get(id);
        if (!user) return null;

        const updated = new UserEntity({
            id: user.id,
            emailEncrypted: user.emailEncrypted,
            emailLookupHash: user.emailLookupHash,
            passwordHash: user.passwordHash,
            name: user.name,
            emailVerified: true,
            createdAt: user.createdAt,
            updatedAt: new Date(),
        });
        this.users.set(id, updated);
        return updated;
    }
}
