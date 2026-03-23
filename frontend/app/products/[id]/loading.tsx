import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton variant="card" className="aspect-square" />
            <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-32" />
                <Skeleton variant="card" className="h-40" />
            </div>
        </div>
    );
}
