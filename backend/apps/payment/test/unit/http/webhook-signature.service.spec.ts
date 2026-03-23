import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { WebhookSignatureService } from '../../../src/infrastructure/inbound/http/webhook-signature.service';

describe('WebhookSignatureService', () => {
  const secret = 'test-webhook-secret';
  const dataId = 'pay-123';
  const requestId = 'req-abc';
  const ts = '1700000000';

  function buildSignature(dataIdValue: string, xRequestIdValue: string): string {
    const manifest = `id:${dataIdValue};request-id:${xRequestIdValue};ts:${ts};`;
    const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    return `ts=${ts},v1=${v1}`;
  }

  async function createService(config: Record<string, string>): Promise<WebhookSignatureService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookSignatureService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => config[key],
          },
        },
      ],
    }).compile();
    return module.get(WebhookSignatureService);
  }

  it('isSecretConfigured is false when secret missing or blank', async () => {
    const s1 = await createService({});
    expect(s1.isSecretConfigured()).toBe(false);

    const s2 = await createService({ MERCADOPAGO_WEBHOOK_SECRET: '   ' });
    expect(s2.isSecretConfigured()).toBe(false);
  });

  it('validate returns false when secret is not configured', async () => {
    const sut = await createService({});
    expect(sut.validate(dataId, buildSignature(dataId, requestId), requestId)).toBe(false);
  });

  it('validate returns true for a valid Mercado Pago-style manifest', async () => {
    const sut = await createService({ MERCADOPAGO_WEBHOOK_SECRET: secret });
    const xSignature = buildSignature(dataId, requestId);
    expect(sut.isSecretConfigured()).toBe(true);
    expect(sut.validate(dataId, xSignature, requestId)).toBe(true);
  });

  it('validate returns false when signature header is missing or wrong', async () => {
    const sut = await createService({ MERCADOPAGO_WEBHOOK_SECRET: secret });
    expect(sut.validate(dataId, undefined, requestId)).toBe(false);
    expect(sut.validate(dataId, 'ts=1,v1=deadbeef', requestId)).toBe(false);
  });
});
