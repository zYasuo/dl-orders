import { UserEntity } from '../../src/domain/entities/user.entity';
import { AuthUserRepositoryPort } from '../../src/domain/ports/repositories/auth-user-repository.port';

export class InMemoryAuthUserRepository extends AuthUserRepositoryPort {
  private readonly users = new Map<string, UserEntity>();

  async create(entity: UserEntity): Promise<UserEntity | null> {
    const existing = Array.from(this.users.values()).find(
      (u) => u.emailLookupHash === entity.emailLookupHash,
    );
    if (existing) return null;
    this.users.set(entity.id, entity);
    return entity;
  }

  async findByEmailLookupHash(emailLookupHash: string): Promise<UserEntity | null> {
    return (
      Array.from(this.users.values()).find((u) => u.emailLookupHash === emailLookupHash) ?? null
    );
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

  async changePassword(id: string, passwordHash: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    const updated = new UserEntity({
      id: user.id,
      emailEncrypted: user.emailEncrypted,
      emailLookupHash: user.emailLookupHash,
      passwordHash,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });
    this.users.set(id, updated);
    return true;
  }
}
