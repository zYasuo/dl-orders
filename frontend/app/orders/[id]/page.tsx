import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderDetail } from '@/modules/orders/components/order-detail';

type Props = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Props) {
    const { id } = await params;
    return (
        <Suspense fallback={<Skeleton variant="card" className="h-64" />}>
            <OrderDetail orderId={id} />
        </Suspense>
    );
}
