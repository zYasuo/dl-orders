import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureService {
  constructor(private readonly configService: ConfigService) {}

  validate(
    dataId: string,
    xSignature: string | undefined,
    xRequestId: string | undefined,
  ): boolean {
    const secret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');
    if (!secret) return true;
    if (!xSignature) return false;

    const ts = this.parseHeaderValue(xSignature, 'ts');
    const v1 = this.parseHeaderValue(xSignature, 'v1');
    if (!ts || !v1) return false;

    const requestId = xRequestId ?? '';
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    if (expected.length !== v1.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
  }

  private parseHeaderValue(header: string, key: string): string | null {
    const part = header.split(',').find((p) => p.trimStart().startsWith(`${key}=`));

    if (!part) return null;

    const value = part.split('=').slice(1).join('=').trim();

    return value || null;
  }
}
