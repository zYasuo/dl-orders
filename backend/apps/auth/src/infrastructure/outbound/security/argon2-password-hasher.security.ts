import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { IPasswordHasherPort } from '../../../domain/ports/security/password-hasher.port';

@Injectable()
export class Argon2PasswordHasher extends IPasswordHasherPort {
  async hash(plain: string): Promise<string> {
    const hashConfig = {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 4,
    };

    return argon2.hash(plain, hashConfig);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
