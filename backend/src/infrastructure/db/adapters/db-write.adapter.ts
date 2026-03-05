import { PrismaPg } from '@prisma/adapter-pg';
import { writeConnectionString } from 'src/config/db/db-connection.config';

export const writeAdapter = new PrismaPg({ connectionString: writeConnectionString });
