import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import type { TJwtPayload } from './jwt-auth.guard';

/** Header sent by internal services (e.g. payment → orders) when SERVICE_AUTH_SECRET is set. */
export const SERVICE_AUTH_HEADER = 'x-service-auth';

/**
 * Allows either:
 * - `x-service-auth` matching `SERVICE_AUTH_SECRET` (service-to-service), or
 * - `Authorization: Bearer` JWT verified with `JWT_SECRET` (end users).
 */
@Injectable()
export class ServiceOrJwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const serviceSecret = this.configService.get<string>('SERVICE_AUTH_SECRET')?.trim();
    const rawHeader = request.headers[SERVICE_AUTH_HEADER];
    const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (serviceSecret && headerValue === serviceSecret) {
      return Promise.resolve(true);
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Promise.reject(new UnauthorizedException('Missing or invalid Authorization header'));
    }

    const token = authHeader.slice(7);
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      return Promise.reject(new UnauthorizedException('JWT not configured'));
    }

    try {
      const decoded = jwt.verify(token, secret) as TJwtPayload;
      (request as Request & { user: TJwtPayload }).user = decoded;

      return Promise.resolve(true);
    } catch {
      return Promise.reject(new UnauthorizedException('Invalid or expired token'));
    }
  }
}
