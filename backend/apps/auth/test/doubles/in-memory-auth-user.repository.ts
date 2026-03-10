import { User } from '../../src/domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../src/domain/ports/auth-user-repository.port';
import { TCreateAuthUser } from '../../src/domain/types/auth-user-repository.types';

export class InMemoryAuthUserRepository extends IAuthUserRepositoryPort {
    private readonly users = new Map<string, User>();

    async create(data: TCreateAuthUser): Promise<User | null> {
        const existing = Array.from(this.users.values()).find(
            (u) => u.emailLookupHash === data.emailLookupHash,
        );
        if (existing) return null;
        const now = new Date();
        const user = new User({
            id: crypto.randomUUID(),
            emailEncrypted: data.emailEncrypted,
            emailLookupHash: data.emailLookupHash,
            passwordHash: data.passwordHash,
            name: data.name ?? null,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
        });
        this.users.set(user.id, user);
        return user;
    }

    async findByEmailLookupHash(emailLookupHash: string): Promise<User | null> {
        return Array.from(this.users.values()).find((u) => u.emailLookupHash === emailLookupHash) ?? null;
    }

    async markEmailVerified(id: string): Promise<User | null> {
        const user = this.users.get(id);
        if (!user) return null;
        const updated = new User({
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
