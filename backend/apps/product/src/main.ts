import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, setupSwagger, snakeToCamelBody } from '@app/shared';
import { ProductModule } from './product.module';

async function bootstrap() {
    const app = await NestFactory.create(ProductModule);
    const configService = app.get(ConfigService);

    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(snakeToCamelBody);

    setupSwagger(app, {
        title: 'Product API',
        description: 'Product microservice',
        version: '1.0',
    });

    await app.listen(configService.get<number>('PORT') ?? 3003);
}
bootstrap();
