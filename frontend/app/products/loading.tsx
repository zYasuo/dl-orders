import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
    return (
        <div className="flex flex-col gap-8">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="card" className="h-72" />
                ))}
            </div>
        </div>
    );
}
