import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IJwtPort, TJwtPayload } from '../../../domain/ports/jwt.port';

@Injectable()
export class JwtService extends IJwtPort {
    private readonly secret: string;

    constructor(configService: ConfigService) {
        super();
        this.secret = configService.getOrThrow<string>('JWT_SECRET');
    }

    async verify(token: string): Promise<TJwtPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secret) as TJwtPayload;
            return decoded;
        } catch {
            return null;
        }
    }
}
