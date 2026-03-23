'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastInput = {
    message: string;
    variant?: ToastVariant;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
    toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);

    const toast = useCallback((input: ToastInput) => {
        const id = crypto.randomUUID();
        setItems((prev) => [...prev, { ...input, id }]);
        window.setTimeout(() => {
            setItems((prev) => prev.filter((t) => t.id !== id));
        }, 4500);
    }, []);

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
                aria-live="polite"
            >
                {items.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            'pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-lg',
                            t.variant === 'success' && 'border-success/30 bg-card text-success',
                            t.variant === 'error' && 'border-danger/30 bg-card text-danger',
                            t.variant === 'warning' && 'border-warning/30 bg-card text-warning',
                            (!t.variant || t.variant === 'info') && 'border-border bg-card text-foreground',
                        )}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}
