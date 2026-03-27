'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useSession } from '@/modules/auth/hooks/use-session';
import type { CartItem } from '@/lib/cart-storage';
import { scheduleCartAbandonmentDebounced, cancelCartAbandonment } from '@/lib/cart-abandonment-schedule';

export function CartAbandonmentPanel({ items }: { items: CartItem[] }) {
    const { data: user } = useSession();
    const [consent, setConsent] = useState(false);
    const [email, setEmail] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const syncSchedule = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            if (items.length === 0) {
                void cancelCartAbandonment();
                return;
            }
            const resolvedEmail = email.trim() || user?.email?.trim() || '';
            if (!consent || !resolvedEmail) {
                void cancelCartAbandonment();
                return;
            }
            void scheduleCartAbandonmentDebounced({
                email: resolvedEmail,
                items,
                consent,
            });
        }, 500);
    }, [consent, email, user?.email, items]);

    useEffect(() => {
        syncSchedule();
    }, [items, consent, email, user?.email, syncSchedule]);

    if (items.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="cart-reminder-heading" className="mt-16 border-t border-black/6 pt-12">
            <div className="mx-auto max-w-lg space-y-6">
                <div className="space-y-2">
                    <h2 id="cart-reminder-heading" className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Email reminder
                    </h2>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                        Optional — one gentle reminder if you leave without checking out (about fifteen minutes).
                    </p>
                </div>
                <Field label="Email" htmlFor="cart-reminder-email" hint="Only used for the reminder if you opt in below.">
                    <Input
                        id="cart-reminder-email"
                        type="email"
                        autoComplete="email"
                        className="rounded-xl border-black/8"
                        value={email}
                        placeholder={user?.email ?? undefined}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>
                <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-snug text-foreground/85">
                    <input
                        type="checkbox"
                        className="mt-0.5 size-4 rounded border-black/15 text-primary focus-visible:ring-2 focus-visible:ring-ring"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>I agree to receive one cart reminder email.</span>
                </label>
            </div>
        </section>
    );
}
