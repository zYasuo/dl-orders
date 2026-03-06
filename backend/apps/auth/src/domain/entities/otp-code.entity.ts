export type TOtpCodeParams = {
    readonly id: string;
    readonly code: string;
    readonly userId: string;
    readonly expiresAt: Date;
    used: boolean;
    readonly createdAt: Date;
};

export class OtpCode {
    constructor(private params: TOtpCodeParams) {}

    get id() {
        return this.params.id;
    }
    get code() {
        return this.params.code;
    }
    get userId() {
        return this.params.userId;
    }
    get expiresAt() {
        return this.params.expiresAt;
    }
    get used() {
        return this.params.used;
    }
    get createdAt() {
        return this.params.createdAt;
    }

    isExpired(): boolean {
        return new Date() > this.params.expiresAt;
    }
}
