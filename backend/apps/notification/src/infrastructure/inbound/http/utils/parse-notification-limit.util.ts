import { BadRequestException } from '@nestjs/common';

export const MAX_NOTIFICATION_LIMIT = 100;

export function parseNotificationLimit(limit?: string): number | undefined {
  if (limit == null || limit === '') return undefined;
  const n = Number.parseInt(limit, 10);
  if (!Number.isInteger(n) || n < 1) {
    throw new BadRequestException('limit must be a positive integer');
  }
  return Math.min(n, MAX_NOTIFICATION_LIMIT);
}
