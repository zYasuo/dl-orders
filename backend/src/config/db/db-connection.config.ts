export const writeConnectionString = process.env.DATABASE_WRITE_URL ?? process.env.DATABASE_WRITE_URL ?? '';

export const readConnectionString = process.env.DATABASE_READ_URL ?? writeConnectionString;
