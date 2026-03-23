import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', {
    variants: {
        variant: {
            pending: 'bg-warning/15 text-warning',
            confirmed: 'bg-success/15 text-success',
            cancelled: 'bg-danger/15 text-danger',
            approved: 'bg-success/15 text-success',
            rejected: 'bg-danger/15 text-danger',
            default: 'bg-muted text-muted-foreground',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
