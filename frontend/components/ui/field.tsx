import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FieldProps = {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    children: ReactNode;
    className?: string;
};

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
                {label}
            </label>
            {children}
            {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            {error ? <p className="text-xs text-danger" role="alert">
                {error}
            </p> : null}
        </div>
    );
}
