import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'line' | 'circle' | 'card';
};

export function Skeleton({ className, variant = 'line', ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-muted',
                variant === 'line' && 'h-4 w-full rounded-md',
                variant === 'circle' && 'size-10 rounded-full',
                variant === 'card' && 'h-40 w-full rounded-lg',
                className,
            )}
            {...props}
        />
    );
}
