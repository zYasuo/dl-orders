import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';

const labels: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
};

const variants: Record<OrderStatus, 'pending' | 'confirmed' | 'cancelled' | 'default'> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
