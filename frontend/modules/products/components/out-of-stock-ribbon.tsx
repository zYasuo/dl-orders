import { PackageX } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    variant: 'overlay' | 'inline';
    className?: string;
};

export function OutOfStockRibbon({ variant, className }: Props) {
    const base =
        'inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-background shadow-sm';

    if (variant === 'overlay') {
        return (
            <span
                role="status"
                className={cn(
                    base,
                    'pointer-events-none absolute left-1/2 top-2 z-10 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 sm:top-3 sm:text-[12px]',
                    className,
                )}
            >
                <PackageX className="size-3.5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
                Out of stock
            </span>
        );
    }

    return (
        <span role="status" className={cn(base, 'text-[12px] font-semibold normal-case tracking-normal', className)}>
            <PackageX className="size-3.5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
            Out of stock
        </span>
    );
}

export function StockUnverifiedHint({ className }: { className?: string }) {
    return (
        <p role="status" className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
            Stock could not be verified.
        </p>
    );
}
