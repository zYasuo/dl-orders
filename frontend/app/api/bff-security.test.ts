import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';
import { POST as inventoryStockPost } from '@/app/api/inventory/stock/route';
import { PUT as cartAbandonmentPut, DELETE as cartAbandonmentDelete } from '@/app/api/cart/abandonment/route';

let sessionCookieValue: string | undefined;

vi.mock('next/headers', () => ({
    cookies: async () => ({
        get: (name: string) =>
            name === SESSION_COOKIE_NAME && sessionCookieValue
                ? { value: sessionCookieValue }
                : undefined,
    }),
}));

describe('BFF security (session before internal service proxy)', () => {
    beforeEach(() => {
        sessionCookieValue = undefined;
        process.env.INVENTORY_SERVICE_URL = 'http://inventory.test';
        process.env.SERVICE_AUTH_SECRET = 'secret';
        process.env.NOTIFICATION_SERVICE_URL = 'http://notification.test';
        process.env.USERS_SERVICE_URL = 'http://users.test';
    });

    it('POST /api/inventory/stock proxies without session (catalog SSR uses service auth only)', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            text: async () =>
                JSON.stringify({
                    success: true,
                    timestamp: '2025-01-01T00:00:00.000Z',
                    data: [
                        {
                            productId: 'p1',
                            quantity: 10,
                            inStock: true,
                            lastUnits: false,
                        },
                    ],
                }),
        });

        const req = new Request('http://localhost/api/inventory/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: ['p1'] }),
        });
        const res = await inventoryStockPost(req);
        expect(res.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledWith(
            'http://inventory.test/api/v1/inventories/lookup',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ 'x-service-auth': 'secret' }),
            }),
        );
    });

    it('PUT /api/cart/abandonment returns 401 without session cookie', async () => {
        const body = {
            sessionKey: 'abcd1234abcd1234',
            email: 'a@b.com',
            resumeUrl: 'https://example.com/cart',
            pendingUntil: new Date(Date.now() + 60_000).toISOString(),
            summaryLines: 'x',
        };
        const req = new Request('http://localhost/api/cart/abandonment', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const res = await cartAbandonmentPut(req);
        expect(res.status).toBe(401);
    });

    it('DELETE /api/cart/abandonment returns 401 without session cookie', async () => {
        const req = new Request('http://localhost/api/cart/abandonment?sessionKey=abcd1234abcd1234', {
            method: 'DELETE',
        });
        const res = await cartAbandonmentDelete(req);
        expect(res.status).toBe(401);
    });

    it('PUT /api/cart/abandonment returns 403 when body email does not match profile', async () => {
        sessionCookieValue = 'fake-jwt';

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ email: 'owner@example.com' }),
        });

        const body = {
            sessionKey: 'abcd1234abcd1234',
            email: 'other@example.com',
            resumeUrl: 'https://example.com/cart',
            pendingUntil: new Date(Date.now() + 60_000).toISOString(),
            summaryLines: 'x',
        };
        const req = new Request('http://localhost/api/cart/abandonment', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const res = await cartAbandonmentPut(req);
        expect(res.status).toBe(403);
    });
});
