import { Transport, MicroserviceOptions } from '@nestjs/microservices';

export const rabbitmqOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: process.env.QUEUE_NAME ?? 'orders_queue',
        queueOptions: {
            durable: true,
        },
    },
};
