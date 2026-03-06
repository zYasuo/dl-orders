import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { snakeToCamelBody } from '@app/shared';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);

    app.use(snakeToCamelBody);

    await app.listen(configService.get<number>('PORT') ?? 3005);
}
bootstrap();
