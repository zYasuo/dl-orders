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

export class User {
    constructor(private params: TUserParams) {}

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
