export type TUserParams = {
    readonly id: string;
    readonly emailEncrypted: string;
    readonly emailLookupHash: string;
    readonly passwordHash: string;
    readonly name: string | null;
    emailVerified: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

export class UserEntity {
    constructor(private params: TUserParams) {}

    static create(params: {
        emailEncrypted: string;
        emailLookupHash: string;
        passwordHash: string;
        name?: string | null;
    }): UserEntity {
        
        const now = new Date();
        return new UserEntity({
            id: crypto.randomUUID(),
            emailEncrypted: params.emailEncrypted,
            emailLookupHash: params.emailLookupHash,
            passwordHash: params.passwordHash,
            name: params.name ?? null,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
        });
    }

    get id() {
        return this.params.id;
    }
    get emailEncrypted() {
        return this.params.emailEncrypted;
    }
    get emailLookupHash() {
        return this.params.emailLookupHash;
    }
    get passwordHash() {
        return this.params.passwordHash;
    }
    get name() {
        return this.params.name;
    }
    get emailVerified() {
        return this.params.emailVerified;
    }
    get createdAt() {
        return this.params.createdAt;
    }
    get updatedAt() {
        return this.params.updatedAt;
    }
}
