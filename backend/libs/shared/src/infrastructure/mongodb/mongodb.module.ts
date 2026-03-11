import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

export const MONGODB_DB = 'MONGODB_DB';

@Module({})
export class MongoDBModule {
    static forRoot(): DynamicModule {
        return {
            module: MongoDBModule,
            global: false,
            providers: [
                {
                    provide: MONGODB_DB,
                    inject: [ConfigService],
                    useFactory: async (config: ConfigService): Promise<Db> => {
                        const uri = config.getOrThrow<string>('MONGODB_URI');
                        const client = new MongoClient(uri);
                        await client.connect();
                        return client.db();
                    },
                },
            ],
            exports: [MONGODB_DB],
        };
    }
}
