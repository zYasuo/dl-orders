import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig, env } from 'prisma/config';

config({ path: resolve(__dirname, '..', '.env') });

export default defineConfig({
    schema: 'schema.prisma',
    datasource: {
        url: env('DATABASE_URL'),
    },
});
