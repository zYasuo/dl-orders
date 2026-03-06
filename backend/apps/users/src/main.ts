import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { snakeToCamelBody } from '@app/shared';
import { UsersModule } from './users.module';

async function bootstrap() {
    const app = await NestFactory.create(UsersModule);
    const configService = app.get(ConfigService);

    app.use(snakeToCamelBody);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: configService.getOrThrow<string>('QUEUE_NAME'),
            queueOptions: { durable: true },
        },
    });

    await app.startAllMicroservices();

    await app.listen(configService.get<number>('PORT') ?? 3006);
}
bootstrap();
