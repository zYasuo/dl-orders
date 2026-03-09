import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter, setupSwagger, snakeToCamelBody } from '@app/shared';
import { UsersModule } from './users.module';

async function bootstrap() {
    const app = await NestFactory.create(UsersModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(snakeToCamelBody);

    setupSwagger(app, {
        title: 'Users API',
        description: 'Users microservice',
        version: '1.0',
    });

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
