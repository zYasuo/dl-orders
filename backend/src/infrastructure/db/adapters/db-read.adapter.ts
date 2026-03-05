import { PrismaPg } from '@prisma/adapter-pg';
import { readConnectionString } from 'src/config/db/db-connection.config';

export const readAdapter = new PrismaPg({ connectionString: readConnectionString });
