import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class InternalApiSecretGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.configService.get<string>('INTERNAL_API_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException('INTERNAL_API_SECRET is not configured');
    }
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers['x-internal-secret'];
    const value = typeof header === 'string' ? header : header?.[0];
    if (value !== secret) {
      throw new UnauthorizedException('Invalid internal secret');
    }
    return true;
  }
}
