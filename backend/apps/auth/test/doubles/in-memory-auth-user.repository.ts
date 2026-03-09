import { User } from '../../src/domain/entities/user.entity';
import { IAuthUserRepositoryPort } from '../../src/domain/ports/auth-user-repository.port';
import { TCreateAuthUser } from '../../src/domain/types/auth-user-repository.types';

export class InMemoryAuthUserRepository extends IAuthUserRepositoryPort {
    private readonly users = new Map<string, User>();

    async create(data: TCreateAuthUser): Promise<User | null> {
        const now = new Date();
        const user = new User({
            id: crypto.randomUUID(),
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name ?? null,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
        });
        const byEmail = Array.from(this.users.values()).find((u) => u.email === data.email);
        if (byEmail) return null;
        this.users.set(user.id, user);
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return Array.from(this.users.values()).find((u) => u.email === email) ?? null;
    }

    async markEmailVerified(id: string): Promise<User | null> {
        const user = this.users.get(id);
        if (!user) return null;
        const updated = new User({
            id: user.id,
            email: user.email,
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
