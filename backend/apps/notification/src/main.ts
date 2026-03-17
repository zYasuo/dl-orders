import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, setupSwagger, snakeToCamelBody } from '@app/shared';
import { NotificationModule } from './notification.module';

async function bootstrap() {
    const app = await NestFactory.create(NotificationModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(snakeToCamelBody);

    setupSwagger(app, {
        title: 'Notification API',
        description: 'Notification microservice',
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

    const port = configService.get<number>('PORT', 3004);
    await app.listen(port);
}
void bootstrap();
