'use client';

import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastAction = {
    label: string;
    onClick: () => void;
};

export type ToastInput = {
    message: string;
    variant?: ToastVariant;
    action?: ToastAction;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
    toast: (input: ToastInput) => void;
};

const AUTO_DISMISS_MS = 5200;

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
    ToastVariant,
    {
        Icon: LucideIcon;
        iconWrap: string;
        bar: string;
    }
> = {
    success: {
        Icon: CheckCircle2,
        iconWrap: 'bg-success/20 text-success',
        bar: 'bg-success',
    },
    error: {
        Icon: XCircle,
        iconWrap: 'bg-danger/20 text-danger',
        bar: 'bg-danger',
    },
    warning: {
        Icon: AlertTriangle,
        iconWrap: 'bg-warning/15 text-warning',
        bar: 'bg-warning',
    },
    info: {
        Icon: Info,
        iconWrap: 'bg-primary/15 text-primary',
        bar: 'bg-primary',
    },
};

function ToastView({
    item,
    onDismiss,
}: {
    item: ToastItem;
    onDismiss: () => void;
}) {
    const variant: ToastVariant = item.variant ?? 'info';
    const { Icon, iconWrap, bar } = VARIANT_META[variant];

    return (
        <div
            role="status"
            className={cn(
                'pointer-events-auto relative flex gap-3 overflow-hidden rounded-xl border border-border bg-popover pl-3 pr-2 py-3 shadow-lg shadow-black/50 ring-1 ring-white/10',
            )}
        >
            <span className={cn('absolute left-0 top-0 h-full w-1 rounded-l-xl', bar)} aria-hidden />
            <span
                className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full', iconWrap)}
                aria-hidden
            >
                <Icon className="size-[18px] stroke-[2.25]" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium leading-snug text-foreground">{item.message}</p>
                {item.action ? (
                    <button
                        type="button"
                        className="mt-2.5 text-left text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/85 hover:underline"
                        onClick={() => {
                            item.action?.onClick();
                            onDismiss();
                        }}
                    >
                        {item.action.label}
                    </button>
                ) : null}
            </div>
            <button
                type="button"
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss notification"
                onClick={onDismiss}
            >
                <X className="size-4" strokeWidth={2} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: string) => {
        setItems((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((input: ToastInput) => {
        const id = crypto.randomUUID();
        setItems((prev) => [...prev, { ...input, id }]);
        window.setTimeout(() => {
            dismiss(id);
        }, AUTO_DISMISS_MS);
    }, [dismiss]);

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:w-[min(100vw-2rem,24rem)]"
                aria-live="polite"
            >
                {items.map((t) => (
                    <ToastView key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
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
