import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export type TJwtPayload = { sub: string; email: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }
        const token = authHeader.slice(7);
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new UnauthorizedException('JWT not configured');
        }
        try {
            const decoded = jwt.verify(token, secret) as TJwtPayload;
            (request as Request & { user: TJwtPayload }).user = decoded;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
