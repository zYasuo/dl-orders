import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { StandardErrorResponseDto } from '../filters/standard-error.response';

function isSwaggerEnabled(): boolean {
  const flag = process.env.ENABLE_SWAGGER;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return nodeEnv !== 'production';
}

export function setupSwagger(
  app: INestApplication,
  options: { title: string; description: string; version: string },
) {

  if (!isSwaggerEnabled()) {
    return;
  }
  
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
