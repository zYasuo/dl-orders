import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import ms from 'ms';
import { IJwtPort, TJwtPayload } from '../../../domain/ports/security/jwt.port';

@Injectable()
export class JwtService extends IJwtPort {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor(configService: ConfigService) {
        super();
        this.secret = configService.getOrThrow<string>('JWT_SECRET');
        this.expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1d');
    }

    getExpiresInSeconds(): number {
        const toMs = ms as (value: string) => number;
        return Math.floor(toMs(this.expiresIn) / 1000);
    }

    sign(payload: TJwtPayload): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'] }, (err, encoded) => {
                if (err) reject(err);
                else resolve(encoded!);
            });
        });
    }

    verify(token: string): Promise<TJwtPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secret) as TJwtPayload;
            return Promise.resolve(decoded);
        } catch {
            return Promise.resolve(null);
        }
    }
}
