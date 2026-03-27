import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import type { TJwtPayload } from './jwt-auth.guard';

export const SERVICE_AUTH_HEADER = 'x-service-auth';

export const INTERNAL_SERVICE_AUTH_REQUEST_KEY = 'internalServiceAuth' as const;

export type TServiceOrJwtRequest = Request & {
  user?: TJwtPayload;
  [INTERNAL_SERVICE_AUTH_REQUEST_KEY]?: true;
};


@Injectable()
export class ServiceOrJwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const serviceSecret = this.configService.get<string>('SERVICE_AUTH_SECRET')?.trim();
    const rawHeader = request.headers[SERVICE_AUTH_HEADER];
    const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (serviceSecret && headerValue === serviceSecret) {
      (request as TServiceOrJwtRequest)[INTERNAL_SERVICE_AUTH_REQUEST_KEY] = true;
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
      (request as TServiceOrJwtRequest).user = decoded;

      return Promise.resolve(true);
    } catch {
      return Promise.reject(new UnauthorizedException('Invalid or expired token'));
    }
  }
}
