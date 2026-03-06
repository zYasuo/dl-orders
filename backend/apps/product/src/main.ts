import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { snakeToCamelBody } from '@app/shared';
import { ProductModule } from './product.module';

async function bootstrap() {
    const app = await NestFactory.create(ProductModule);
    const configService = app.get(ConfigService);

    app.use(snakeToCamelBody);

    await app.listen(configService.get<number>('PORT') ?? 3003);
}
bootstrap();
