export type TUserProfileParams = {
    readonly id: string;
    readonly email: string;
    readonly name: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

export class UserProfile {
    constructor(private params: TUserProfileParams) {}

    static create(params: TUserProfileParams): UserProfile {
        return new UserProfile(params);
    }

    get id() {
        return this.params.id;
    }
    get email() {
        return this.params.email;
    }
    get name() {
        return this.params.name;
    }
    get createdAt() {
        return this.params.createdAt;
    }
    get updatedAt() {
        return this.params.updatedAt;
    }
}
