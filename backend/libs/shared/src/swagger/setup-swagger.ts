import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { StandardErrorResponseDto } from '../filters/standard-error.response';

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

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [StandardErrorResponseDto],
  });

  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.get) {
    httpAdapter.get('/docs-json', (_req: unknown, res: unknown) => {
      (res as { json: (doc: unknown) => void }).json(document);
    });
  }

  app.use(
    '/docs',
    apiReference({
      spec: {
        content: document,
      },
    } as Parameters<typeof apiReference>[0]),
  );
}
