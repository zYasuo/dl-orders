export type TUserParams = {
    readonly id: string;
    readonly email: string;
    readonly passwordHash: string;
    readonly name: string | null;
    emailVerified: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

export class User {
    constructor(private params: TUserParams) {}

    get id() {
        return this.params.id;
    }
    get email() {
        return this.params.email;
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
