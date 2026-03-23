import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="flex flex-col gap-4 py-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton variant="card" className="h-64" />
        </div>
    );
}
