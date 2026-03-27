import type { Request } from 'express';
import {
  INTERNAL_SERVICE_AUTH_REQUEST_KEY,
  type TServiceOrJwtRequest,
  type TJwtPayload,
} from '@app/shared';

export type TOrderAccessContext =
  | { mode: 'internal-service' }
  | { mode: 'user'; email: string };

export function normalizeOrderRecipientEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function orderAccessFromRequest(req: Request): TOrderAccessContext {
  const r = req as TServiceOrJwtRequest;
  if (r[INTERNAL_SERVICE_AUTH_REQUEST_KEY]) {
    return { mode: 'internal-service' };
  }
  const user = r.user as TJwtPayload | undefined;
  if (user?.email) {
    return { mode: 'user', email: normalizeOrderRecipientEmail(user.email) };
  }
  throw new Error('orderAccessFromRequest: missing JWT user after guard');
}
