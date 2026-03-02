import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { rabbitmqOptions } from './config/rabbitMQ/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(rabbitmqOptions);
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
