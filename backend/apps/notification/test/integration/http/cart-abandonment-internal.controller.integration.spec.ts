import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ServiceOrJwtAuthGuard } from '@app/shared/auth/service-or-jwt-auth.guard';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';
import { TransformInterceptor } from '@app/shared/interceptors/transform.interceptor';
import { UpsertCartAbandonmentScheduleUseCase } from '../../../src/application/use-cases/upsert-cart-abandonment-schedule.use-case';
import { CancelCartAbandonmentScheduleUseCase } from '../../../src/application/use-cases/cancel-cart-abandonment-schedule.use-case';
import { CartAbandonmentInternalController } from '../../../src/infrastructure/inbound/http/cart-abandonment-internal.controller';
import { CartAbandonmentScheduleRepositoryPort } from '../../../src/domain/ports/cart-abandonment-schedule-repository.port';
import { InMemoryCartAbandonmentScheduleRepository } from '../../doubles/in-memory-cart-abandonment-schedule.repository';

describe('CartAbandonmentInternalController (integration)', () => {
  let app: INestApplication;
  let repo: InMemoryCartAbandonmentScheduleRepository;

  beforeEach(async () => {
    repo = new InMemoryCartAbandonmentScheduleRepository();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartAbandonmentInternalController],
      providers: [
        UpsertCartAbandonmentScheduleUseCase,
        CancelCartAbandonmentScheduleUseCase,
        { provide: CartAbandonmentScheduleRepositoryPort, useValue: repo },
      ],
    })
      .overrideGuard(ServiceOrJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('PUT persists schedule and returns success envelope', async () => {
    const pendingUntil = '2036-02-01T15:00:00.000Z';
    const res = await request(app.getHttpServer())
      .put('/api/v1/internal/cart-abandonment')
      .set('x-service-auth', 'ignored-by-mock-guard')
      .send({
        sessionKey: 'http-int-session-xx',
        email: 'http@test.com',
        resumeUrl: 'http://localhost:3000/cart',
        pendingUntil,
        summaryLines: 'p:1',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ ok: true });

    const row = repo.getRow('http-int-session-xx');
    expect(row?.email).toBe('http@test.com');
    expect(row?.summaryLines).toBe('p:1');
    expect(row?.pendingUntil.toISOString()).toBe(pendingUntil);
  });

  it('PUT returns 400 when body is invalid', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/v1/internal/cart-abandonment')
      .send({
        sessionKey: 'short',
        email: 'not-an-email',
        resumeUrl: 'not-url',
        pendingUntil: 'x',
        summaryLines: '',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('DELETE removes schedule', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/internal/cart-abandonment')
      .send({
        sessionKey: 'del-session-yy',
        email: 'd@test.com',
        resumeUrl: 'http://localhost/c',
        pendingUntil: '2036-03-01T12:00:00.000Z',
        summaryLines: '',
      })
      .expect(200);

    await request(app.getHttpServer())
      .delete('/api/v1/internal/cart-abandonment')
      .query({ sessionKey: 'del-session-yy' })
      .expect(200);

    expect(repo.getRow('del-session-yy')).toBeUndefined();
  });
});
