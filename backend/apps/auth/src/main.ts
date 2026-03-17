import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter, setupSwagger, snakeToCamelBody } from '@app/shared';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(snakeToCamelBody);

    setupSwagger(app, {
        title: 'Auth API',
        description: 'Authentication microservice',
        version: '1.0',
    });

    await app.listen(configService.get<number>('PORT') ?? 3005);
}
void bootstrap();
