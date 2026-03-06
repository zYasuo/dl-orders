export type TCreateUserProfile = {
    id: string;
    email: string;
    name?: string | null;
};

export type TUpdateUserProfile = {
    name?: string | null;
};
