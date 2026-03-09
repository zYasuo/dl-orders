import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export function setupSwagger(
    app: INestApplication,
    options: { title: string; description: string; version: string },
) {
    const config = new DocumentBuilder()
        .setTitle(options.title)
        .setDescription(options.description)
        .setVersion(options.version)
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    app.use(
        '/docs',
        apiReference({
            spec: {
                content: document,
            },
        } as Parameters<typeof apiReference>[0]),
    );
}
