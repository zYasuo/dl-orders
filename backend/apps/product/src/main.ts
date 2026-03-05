import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ProductModule } from './product.module';

async function bootstrap() {
    const app = await NestFactory.create(ProductModule);
    const configService = app.get(ConfigService);

    await app.listen(configService.get<number>('PORT') ?? 3003);
}
bootstrap();
