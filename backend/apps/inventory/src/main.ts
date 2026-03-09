import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, setupSwagger, snakeToCamelBody } from '@app/shared';
import { InventoryModule } from './inventory.module';

async function bootstrap() {
    const app = await NestFactory.create(InventoryModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(snakeToCamelBody);

    setupSwagger(app, {
        title: 'Inventory API',
        description: 'Inventory microservice',
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
    await app.listen(configService.get<number>('PORT') ?? 3002);
}
bootstrap();
