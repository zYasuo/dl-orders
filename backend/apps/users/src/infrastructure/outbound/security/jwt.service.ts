import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPort, TJwtPayload } from '../../../domain/ports/jwt.port';

@Injectable()
export class JwtService extends JwtPort {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    super();
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
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
