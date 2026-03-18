import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REDIS_KEY_PREFIX } from '../../../redis/constants/redis.constants';
import { RedisService } from '../../../redis/redis.service';
import type { IRateLimitConfig, TRateLimitEndpointKey } from '../../../../config/rate-limit.config';
import { RATE_LIMIT_ENDPOINT_KEY } from '../decorators/rate-limit-endpoint.decorator';

function getClientIp(req: Request): string {
  return (
    req.ip ??
    req.socket?.remoteAddress ??
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
      : undefined) ??
    'unknown'
  );
}

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const endpoint = this.reflector.get<TRateLimitEndpointKey | undefined>(
      RATE_LIMIT_ENDPOINT_KEY,
      context.getHandler(),
    );
    if (!endpoint) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = getClientIp(request);
    const config = this.configService.get<IRateLimitConfig>('rateLimit');
    if (!config) {
      return true;
    }

    const entry = config[endpoint];
    if (!entry) {
      return true;
    }

    const key = `${REDIS_KEY_PREFIX}ratelimit:${endpoint}:${ip}`;
    const client = this.redis.getClient();
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, entry.windowSeconds);
    }

    if (count > entry.max) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: 'Too many requests. Please try again later.',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
