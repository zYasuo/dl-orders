import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, setupSwagger, snakeToCamelBody } from '@app/shared';
import { PaymentModule } from './payment.module';

async function bootstrap() {
    const app = await NestFactory.create(PaymentModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(snakeToCamelBody);

    setupSwagger(app, {
        title: 'Payment API',
        description: 'Payment microservice',
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
    await app.listen(configService.get<number>('PORT') ?? 3007);
}
bootstrap();
