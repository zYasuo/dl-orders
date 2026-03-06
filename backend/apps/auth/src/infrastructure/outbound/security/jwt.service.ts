import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IJwtPort, TJwtPayload } from '../../../domain/ports/jwt.port';

@Injectable()
export class JwtService extends IJwtPort {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor(configService: ConfigService) {
        super();
        this.secret = configService.getOrThrow<string>('JWT_SECRET');
        this.expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1d');
    }

    async sign(payload: TJwtPayload): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                this.secret,
                { expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'] },
                (err, encoded) => {
                    if (err) reject(err);
                    else resolve(encoded!);
                },
            );
        });
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
