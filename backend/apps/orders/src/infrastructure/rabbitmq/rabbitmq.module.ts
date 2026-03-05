import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QUEUES } from '@app/shared';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'INVENTORY_SERVICE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.getOrThrow<string>('RABBITMQ_URL')],
                        queue: QUEUES.INVENTORY,
                        queueOptions: { durable: true },
                    },
                }),
            },
            {
                name: 'NOTIFICATION_SERVICE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.getOrThrow<string>('RABBITMQ_URL')],
                        queue: QUEUES.NOTIFICATION,
                        queueOptions: { durable: true },
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class RabbitMQModule {}
