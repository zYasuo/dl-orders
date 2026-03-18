export type TCreateAuthUser = {
  emailEncrypted: string;
  emailLookupHash: string;
  passwordHash: string;
  name?: string | null;
};
