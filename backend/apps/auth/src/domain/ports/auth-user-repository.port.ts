import { User } from '../entities/user.entity';
import { TCreateAuthUser } from '../types/auth-user-repository.types';

export abstract class IAuthUserRepositoryPort {
    abstract create(data: TCreateAuthUser): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract markEmailVerified(id: string): Promise<User | null>;
}
