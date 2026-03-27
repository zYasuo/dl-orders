import { getOrCreateCartSessionId, type CartItem } from '@/modules/cart/lib/cart-storage';

export type ScheduleCartAbandonmentInput = {
    email: string;
    items: CartItem[];
    consent: boolean;
};

const REMINDER_DELAY_MS = 15 * 60 * 1000;

function publicOrigin(): string {
    if (typeof window === 'undefined') {
        return '';
    }
    return window.location.origin.replace(/\/$/, '');
}

export async function scheduleCartAbandonmentDebounced(input: ScheduleCartAbandonmentInput): Promise<void> {
    if (!input.consent || !input.email || input.items.length === 0) {
        await cancelCartAbandonment();
        return;
    }
    const origin = publicOrigin();
    if (!origin) {
        return;
    }
    const sessionKey = getOrCreateCartSessionId();
    const pendingUntil = new Date(Date.now() + REMINDER_DELAY_MS).toISOString();
    const resumeUrl = `${origin}/cart`;
    const lines = input.items.map((i) => `${i.productId}: ${i.quantity}`).join('; ').slice(0, 1500);
    try {
        await fetch('/api/cart/abandonment', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionKey,
                email: input.email,
                resumeUrl,
                pendingUntil,
                summaryLines: lines,
            }),
        });
    } catch {
    }
}

export async function cancelCartAbandonment(): Promise<void> {
    if (typeof window === 'undefined') {
        return;
    }
    const sessionKey = getOrCreateCartSessionId();
    try {
        await fetch(`/api/cart/abandonment?sessionKey=${encodeURIComponent(sessionKey)}`, {
            method: 'DELETE',
        });
    } catch {
    }
}
