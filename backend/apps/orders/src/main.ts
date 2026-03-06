import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { snakeToCamelBody } from '@app/shared';
import { OrdersModule } from './orders.module';

async function bootstrap() {
    const app = await NestFactory.create(OrdersModule);
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
    await app.listen(configService.get<number>('PORT') ?? 3001);
}
bootstrap();
