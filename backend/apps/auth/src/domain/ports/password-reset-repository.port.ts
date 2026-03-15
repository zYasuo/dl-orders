import { PasswordResetEntity } from "../entities/password-reset.entity";
import { TCreatePasswordReset } from "../types/password-repository.type";


export abstract class IPasswordResetRepositoryPort {
    abstract create(data: TCreatePasswordReset): Promise<PasswordResetEntity>;
    abstract findByToken(token: string): Promise<PasswordResetEntity | null>;
    abstract findByEmailLookupHash(emailLookupHash: string): Promise<PasswordResetEntity | null>;
}