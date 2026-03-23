import type { UserVerifiedEvent } from '@app/shared';
import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserProfileProvisionerPort } from '../../../domain/ports/user-profile-provisioner.port';

@Injectable()
export class HttpUserProfileProvisioner extends UserProfileProvisionerPort {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async provision(event: UserVerifiedEvent): Promise<void> {
    const base = this.configService.get<string>('USERS_SERVICE_URL');
    const secret = this.configService.get<string>('INTERNAL_API_SECRET');
    if (!base || !secret) {
      throw new ServiceUnavailableException(
        'USERS_SERVICE_URL or INTERNAL_API_SECRET is not configured',
      );
    }
    const url = `${base.replace(/\/$/, '')}/api/v1/internal/user-profiles`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify({
        userId: event.userId,
        email: event.email,
        name: event.name,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new BadGatewayException(
        `Users service rejected profile provisioning: ${res.status} ${text}`,
      );
    }
  }
}
