export type TCreateAuthUser = {
    email: string;
    passwordHash: string;
    name?: string | null;
};
