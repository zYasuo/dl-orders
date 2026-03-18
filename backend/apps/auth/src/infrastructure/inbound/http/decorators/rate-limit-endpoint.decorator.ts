import { SetMetadata } from '@nestjs/common';
import type { TRateLimitEndpointKey } from '../../../../config/rate-limit.config';

export const RATE_LIMIT_ENDPOINT_KEY = 'rateLimitEndpoint';

export function RateLimitEndpoint(endpoint: TRateLimitEndpointKey) {
  return SetMetadata(RATE_LIMIT_ENDPOINT_KEY, endpoint);
}
