import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Module({})
export class DynamoDBModule {
    static forRoot(): DynamicModule {
        return {
            module: DynamoDBModule,
            global: false,
            providers: [
                {
                    provide: DynamoDBClient,
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => {
                        const endpoint = config.get<string>('AWS_ENDPOINT');
                        return new DynamoDBClient({
                            region: config.get<string>('AWS_REGION', 'us-east-1'),
                            ...(endpoint && { endpoint }),
                            ...(endpoint && {
                                credentials: {
                                    accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', 'test'),
                                    secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY', 'test'),
                                },
                            }),
                        });
                    },
                },
                {
                    provide: DynamoDBDocumentClient,
                    useFactory: (client: DynamoDBClient) => DynamoDBDocumentClient.from(client),
                    inject: [DynamoDBClient],
                },
            ],
            exports: [DynamoDBClient, DynamoDBDocumentClient],
        };
    }
}
