import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
    return (
        <div className="flex flex-col gap-10">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 max-w-md" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} variant="card" className="h-52 sm:h-56" />
                ))}
            </div>
        </div>
    );
}
