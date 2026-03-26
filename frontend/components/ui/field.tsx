import {
    type HTMLAttributes,
    type LabelHTMLAttributes,
    type ReactNode,
} from 'react';
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

export function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-6', className)} {...props} />;
}

export function FieldStack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

export function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
    return <label className={cn('text-sm font-medium text-foreground', className)} {...props} />;
}

export function FieldDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function FieldSeparator({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
    return (
        <div
            className={cn('relative flex items-center gap-4 py-2', className)}
            role="separator"
            {...props}
        >
            <div className="h-px flex-1 bg-border" aria-hidden />
            {children ? (
                <span className="shrink-0 bg-card px-2 text-xs text-muted-foreground">{children}</span>
            ) : null}
            <div className="h-px flex-1 bg-border" aria-hidden />
        </div>
    );
}
